# AI Exam Practice - Algorithm Solver & Visualizer

🎯 **Công cụ giải bài tập thuật toán AI với trực quan hóa chi tiết từng bước**

## 📚 Danh sách Thuật toán

### 🔍 Thuật toán Tìm kiếm (Search Algorithms)

1. **A\* Search**
   - Công thức: f(n) = g(n) + h(n)
   - Tìm đường đi ngắn nhất sử dụng cả chi phí thực tế và heuristic
   - Input: Đồ thị, chi phí cạnh, heuristic, điểm đầu/cuối
   - Output: Đường đi tối ưu, chi phí, các bước tìm kiếm

2. **Uniform Cost Search (UCS)**
   - Công thức: f(n) = g(n)
   - Tìm đường đi ngắn nhất chỉ dựa vào chi phí thực tế
   - Đảm bảo tìm được đường đi tối ưu

3. **Greedy Best-First Search**
   - Công thức: f(n) = h(n)
   - Tìm kiếm nhanh nhưng không đảm bảo tối ưu
   - Chỉ dựa vào heuristic

### 🎮 Lý thuyết Trò chơi (Game Theory)

4. **Minimax Algorithm**
   - Thuật toán cơ bản cho trò chơi đối kháng
   - Duyệt toàn bộ cây trò chơi (KHÔNG cắt tỉa)
   - Input: Cây trò chơi với các node MAX/MIN
   - Output: Giá trị tối ưu, tất cả node được duyệt

5. **Alpha-Beta Pruning**
   - Tối ưu hóa Minimax với cắt tỉa
   - Giảm số node cần đánh giá
   - Output: Giá trị tối ưu, các node bị cắt tỉa

### 🤖 Supervised Learning

**Định nghĩa**: Học có giám sát - học từ dữ liệu có nhãn (labeled data)

**2 bài toán chính**:
- **Classification (Phân loại)**: Dự đoán nhãn rời rạc
- **Regression (Hồi quy)**: Dự đoán giá trị liên tục

**Các thuật toán trong dự án**:

6. **Naïve Bayes Classifier** *(Classification)*
   - Phân loại dựa trên xác suất Bayes
   - Công thức: P(Class|Features) ∝ P(Class) × ∏P(Feature|Class)
   - Input: Dữ liệu huấn luyện (CSV), dữ liệu cần dự đoán
   - Output: Nhãn dự đoán, xác suất các lớp, bảng tính toán chi tiết

7. **Linear Regression** *(Regression)*
   - Hồi quy tuyến tính đơn giản
   - Công thức: Ŷ = a + bX
   - Input: Dữ liệu (x,y), giá trị x cần dự đoán
   - Output: Phương trình hồi quy, R², giá trị dự đoán, biểu đồ

8. **Decision Tree (Cây quyết định)** *(Classification)*
   - Xây dựng cây quyết định bằng thuật toán ID3
   - Tiêu chí: Information Gain (dựa trên Entropy)
   - Input: Dữ liệu huấn luyện, dữ liệu cần phân loại
   - Output: Cấu trúc cây, kết quả dự đoán, đường đi trên cây, trực quan hóa cây

### 🔮 Unsupervised Learning

**Định nghĩa**: Học không giám sát - học từ dữ liệu không có nhãn

**2 bài toán chính**:
- **Clustering (Phân cụm)**: Nhóm dữ liệu tương tự
- **Association Rules (Luật kết hợp)**: Tìm mối quan hệ giữa các items

**Các thuật toán trong dự án**:

9. **K-Means Clustering** *(Clustering)*
   - Phân cụm dữ liệu thành K nhóm
   - Thuật toán lặp: gán điểm → cập nhật centroid
   - Input: Dữ liệu điểm (x,y), số cụm K, số lần lặp
   - Output: Các cụm, centroids, WCSS, trực quan hóa phân cụm

10. **Apriori Algorithm** *(Association Rules)*
    - Tìm luật kết hợp trong dữ liệu giao dịch
    - Các khái niệm: Support, Confidence, Lift
    - Input: Dữ liệu giao dịch, min support, min confidence
    - Output: Frequent itemsets, association rules, bảng chi tiết

### 🧠 Knowledge Representation (Biểu diễn Tri thức)

11. **Semantic Network (Mạng ngữ nghĩa)**
    - Biểu diễn cơ sở tri thức bằng đồ thị có hướng
    - Quan hệ: is-a, has, can, lives-in, color, etc.
    - Hỗ trợ kế thừa thuộc tính (inheritance)
    - Input: Entities, Relations, Query entity
    - Output: Thuộc tính trực tiếp, thuộc tính kế thừa, trực quan hóa mạng

## 🎨 Tính năng

✅ **Input dễ dàng**: Format đơn giản, textarea với hướng dẫn  
✅ **Output chi tiết**: Kết quả, công thức, bảng tính toán  
✅ **Trực quan hóa**: Vẽ đồ thị, cây, biểu đồ, mạng ngữ nghĩa  
✅ **Từng bước giải**: Step-by-step explanation với màu sắc  
✅ **Responsive**: Giao diện đẹp, hoạt động trên mọi thiết bị  
✅ **Offline**: Chạy hoàn toàn local, không cần internet  

## 🚀 Cách sử dụng

### Chạy trực tiếp
```bash
# Mở file index.html bằng trình duyệt
start index.html

# Hoặc double-click vào file index.html
```

### Sử dụng Live Server (VSCode)
```bash
# Install Live Server extension
# Right-click index.html -> Open with Live Server
```

## 📁 Cấu trúc dự án

```
AI-Exam-Practice/
├── index.html              # Giao diện chính
├── README.md              # Tài liệu này
├── css/
│   └── style.css          # Styling
└── js/
    ├── main.js            # Hàm chính, điều khiển
    ├── astar.js           # A* Search
    ├── ucs.js             # Uniform Cost Search
    ├── greedy.js          # Greedy Best-First
    ├── minimax.js         # Minimax (no pruning)
    ├── alphabeta.js       # Alpha-Beta Pruning
    ├── naivebayes.js      # Naïve Bayes
    ├── regression.js      # Linear Regression
    ├── decisiontree.js    # Decision Tree
    ├── kmeans.js          # K-Means Clustering
    ├── apriori.js         # Apriori Algorithm
    ├── semantic.js        # Semantic Network
    └── visualization.js   # Vẽ đồ thị, trực quan hóa
```

## 📖 Ví dụ sử dụng

### A* Search
```
Nodes: A,B,C,D,E
Edges:
A-B-2
A-E-5
B-C-4
E-C-4
C-D-3

Heuristic:
A=8
B=6
C=1
D=0
E=5

Start: A
Goal: D
```

### Decision Tree
```
CSV Data:
Outlook,Temp,Humidity,Wind,PlayTennis
Sunny,Hot,High,Weak,No
Overcast,Hot,High,Weak,Yes
...

Predict:
Outlook=Sunny
Temp=Cool
Humidity=High
Wind=Strong
```

### K-Means
```
Data:
2,3
3,3
8,7
8,8
...

K: 2
Max Iterations: 10
```

### Semantic Network
```
Entities: Chó,Mèo,Động vật,Chim

Relations:
Chó-is-a-Động vật
Chó-has-Chân
Chó-can-Sủa
Động vật-can-Di chuyển

Query: Chó
→ Kết quả: Chó có thuộc tính "has Chân", "can Sủa" (trực tiếp)
           và "can Di chuyển" (kế thừa từ Động vật)
```

## 🎓 Kiến thức

### So sánh Supervised vs Unsupervised

| Tiêu chí | Supervised Learning | Unsupervised Learning |
|----------|--------------------|-----------------------|
| **Dữ liệu** | Có nhãn (labeled) | Không có nhãn |
| **Mục tiêu** | Dự đoán output cho input mới | Tìm cấu trúc ẩn trong dữ liệu |
| **Bài toán** | Classification, Regression | Clustering, Association |
| **Ví dụ** | Naïve Bayes, Decision Tree, Linear Regression | K-Means, Apriori |

### Minimax vs Alpha-Beta

| Tiêu chí | Minimax | Alpha-Beta |
|----------|---------|------------|
| **Cắt tỉa** | Không | Có |
| **Số node duyệt** | 100% cây | Ít hơn nhiều |
| **Kết quả** | Giống nhau | Giống nhau |
| **Tốc độ** | Chậm hơn | Nhanh hơn |

## 🛠️ Công nghệ

- **HTML5**: Cấu trúc trang
- **CSS3**: Styling và animation
- **JavaScript (Vanilla)**: Logic thuật toán
- **Canvas API**: Vẽ đồ thị và trực quan hóa

## 📝 License

MIT License - Free to use for educational purposes

## 👨‍💻 Author

AI Exam Practice Tool - 2025

---

**💡 Tip**: Thử thay đổi input để thấy thuật toán hoạt động khác nhau!