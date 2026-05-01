from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

class RecommendRequest(BaseModel):
    target_recipe_id: int
    all_recipes: list 

@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    # 1. Chuyển dữ liệu thành DataFrame
    df = pd.DataFrame(req.all_recipes)

    # 2. Chuẩn hóa và gộp đặc trưng
    df['combined_features'] = df['Title'].astype(str) + " " + (df['CategoryName'].astype(str) + " ") * 3 + df['IngredientsText'].astype(str)

    # 3. Tính toán TF-IDF
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df['combined_features'])

    # 4. Tính toán Cosine Similarity
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 5. Tìm index món gốc
    try:
        idx = df.index[df['RecipeID'] == req.target_recipe_id].tolist()[0]
    except IndexError:
        return {"recommended_ids": []}

    # 6. Lấy điểm số tương đồng
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    # Sắp xếp giảm dần theo điểm số
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # ==========================================
    # LỌC THEO NGƯỠNG
    # ==========================================
    # ==========================================
    # BẬT CHẾ ĐỘ DEBUG: IN ĐIỂM RA TERMINAL
    # ==========================================
    print(f"\n[AI DEBUG] Đang tính điểm cho món ID: {req.target_recipe_id}")
    for i, score in sim_scores[1:6]:
        recipe_name = df.iloc[i]['Title']
        print(f" -> Món: '{recipe_name}' | Điểm giống nhau: {score:.4f}")
    # ==========================================
    # Chỉ lấy những món có độ tương đồng trên 0.30 (tương đương 30%)
    # x[0] là index, x[1] là score. Ta bỏ qua phần tử đầu tiên vì là chính nó.
    threshold = 0.30
    valid_recommendations = [x for x in sim_scores[1:] if x[1] > threshold]

    # Nếu không có món nào đủ giống, trả về rỗng
    if not valid_recommendations:
        return {"recommended_ids": []}

    # Lấy Top 5 món từ danh sách đã lọc đủ chất lượng
    top_indices = [i[0] for i in valid_recommendations[:5]]
    
    recommended_ids = df.iloc[top_indices]['RecipeID'].tolist()

    return {"recommended_ids": recommended_ids}