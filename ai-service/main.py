from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Định nghĩa cấu trúc dữ liệu gửi lên
class Recipe(BaseModel):
    RecipeID: int
    Title: str
    CategoryName: str
    IngredientsText: str

class Interaction(BaseModel):
    UserID: int
    RecipeID: int
    TotalScore: float

class RecommendRequest(BaseModel):
    target_recipe_id: int
    all_recipes: List[Recipe]
    # interactions cho phép rỗng nếu Backend chưa gửi qua
    interactions: List[Interaction] = [] 

@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    # 1. Chuyển dữ liệu Món ăn thành DataFrame
    df_recipes = pd.DataFrame([r.dict() for r in req.all_recipes])
    if df_recipes.empty:
        return {"recommended_ids": []}

    # Lấy danh sách ID gốc để làm mỏ neo đồng bộ
    recipe_ids = df_recipes['RecipeID'].tolist()

    # ==========================================
    # LUỒNG 1: TF-IDF (SỨC MẠNH NỘI DUNG - ĐÃ NÂNG CẤP STOP-WORDS)
    # ==========================================
    df_recipes['combined_features'] = df_recipes['Title'].astype(str) + " " + (df_recipes['CategoryName'].astype(str) + " ") * 3 + df_recipes['IngredientsText'].astype(str)
    
    # Danh sách "từ khóa rác" (Gia vị & Đơn vị đo) làm nhiễu thông tin.
    vietnamese_stop_words = [
        "muối", "đường", "bột", "ngọt", "hạt", "nêm", "tiêu", "tỏi", "ớt", 
        "hành", "lá", "ngò", "dầu", "ăn", "nước", "mắm", "gia", "vị", "tương", "đậu",
        "muỗng", "thìa", "g", "kg", "ml", "chút", "ít", "vừa", "đủ", "tùy", "thích",
        "lít", "củ", "quả", "trái", "con", "lạng", "gram", "nhúm", "thái", "băm", "nhỏ"
    ]

    # Bơm danh sách đen vào cho TF-IDF để AI lơ đi các gia vị
    tfidf = TfidfVectorizer(stop_words=vietnamese_stop_words)
    tfidf_matrix = tfidf.fit_transform(df_recipes['combined_features'])
    content_sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    # Ép thành DataFrame vuông vức để lát cộng điểm cho dễ
    content_sim_df = pd.DataFrame(content_sim_matrix, index=recipe_ids, columns=recipe_ids)

    # ==========================================
    # LUỒNG 2: COLLABORATIVE (SỨC MẠNH HÀNH VI NGƯỜI DÙNG)
    # ==========================================
    # Tạo sẵn ma trận toàn số 0 dự phòng trường hợp web mới chưa ai tương tác
    collab_sim_df = pd.DataFrame(0.0, index=recipe_ids, columns=recipe_ids)
    
    if req.interactions:
        df_interact = pd.DataFrame([i.dict() for i in req.interactions])
        # Xây dựng bảng ma trận: Hàng là Món, Cột là User, Ô là Điểm
        user_item_matrix = df_interact.pivot_table(index='RecipeID', columns='UserID', values='TotalScore', fill_value=0)
        # Đồng bộ (những món chưa có ai chấm điểm thì điền số 0)
        user_item_matrix = user_item_matrix.reindex(index=recipe_ids, fill_value=0)
        
        # Tính độ tương đồng hành vi
        collab_matrix = cosine_similarity(user_item_matrix)
        collab_sim_df = pd.DataFrame(collab_matrix, index=recipe_ids, columns=recipe_ids)

    # ==========================================
    # LUỒNG 3: HỢP THỂ MA THUẬT (HYBRID)
    # ==========================================
    # alpha = 0.2 nghĩa là 80% tính chất nguyên liệu + 20% hành vi đám đông
    alpha = 0.2 
    final_sim_df = (alpha * collab_sim_df) + ((1 - alpha) * content_sim_df)

    # Kiểm tra xem món đang xem có tồn tại không
    if req.target_recipe_id not in final_sim_df.index:
        return {"recommended_ids": []}

    # Lấy ra danh sách điểm của món đang xem
    target_scores = final_sim_df.loc[req.target_recipe_id]
    
    # Bỏ chính nó (món gốc) ra khỏi danh sách tính toán
    target_scores = target_scores.drop(labels=[req.target_recipe_id])
    
    # Sắp xếp điểm giảm dần
    sorted_scores = target_scores.sort_values(ascending=False)

    # ==========================================
    # BẬT CHẾ ĐỘ DEBUG: IN ĐIỂM RA TERMINAL CHO SẾP KIỂM TRA
    # ==========================================
    print(f"\n[AI DEBUG HYBRID] Đang tính điểm cho món ID: {req.target_recipe_id}")
    for r_id, score in sorted_scores.head(5).items():
        recipe_name = df_recipes[df_recipes['RecipeID'] == r_id]['Title'].values[0]
        print(f" -> Món: '{recipe_name}' | Tổng điểm Hybrid: {score:.4f}")
    # ==========================================

    # ==========================================
    # LỌC THEO NGƯỠNG & CHỐT HẠ KẾT QUẢ
    # ==========================================
    # Lưu ý: Vì mình chia đôi điểm nên ngưỡng điểm tối đa sẽ thấp hơn ngày xưa. 
    # Sếp cài threshold = 0.20 (20%) là hợp lý để bắt đầu.
    threshold = 0.20 
    recommended_ids = sorted_scores[sorted_scores > threshold].head(5).index.tolist()

    return {"recommended_ids": recommended_ids}