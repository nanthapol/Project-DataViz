# First Jobber Insight

Dashboard วิเคราะห์ว่า **ตำแหน่งงาน IT ต้องการทักษะอะไร และทักษะของตำแหน่งเดียวกันต่างกันอย่างไร** จากประกาศงาน 107,284 รายการ

เว็บที่เผยแพร่แล้ว: https://firstjobberinsight.web.app/

## คำถามของโครงการ
1. ตำแหน่งงานแต่ละตำแหน่งต้องการทักษะอะไร
2. ตำแหน่งเดียวกันมีชุดทักษะต่างกันหรือไม่ และต่างกันอย่างไร
3. ความต่างนั้นมาจากบริษัทหรือไม่

ตอบคำถาม : วิเคราะห์ภาพรวมของตลาดโดยรวมประกาศของทุกบริษัท (ข้อ 1-2) แล้วทดสอบทางสถิติแยกต่างหากว่าบริษัทเป็นตัวกำหนดชุดทักษะหรือไม่ (ข้อ 3)

## ข้อมูล
- ไฟล์: `Combined_IT_Jobs_Dataset_v7.xlsx` ใช้ชีต `Jobs_Dataset (messy)` (ข้อมูลดิบ) 107,284 แถว, 22 ตำแหน่ง, 7,563 บริษัท, วันที่ 2021-01-01 ถึง 2025-12-28
- **ที่มาของข้อมูล:** ไฟล์นี้รวบรวมโดยทีมเราจากชุดข้อมูลสาธารณะบน Kaggle 7 ชุด (เข้าถึงเมื่อ 2026-10-10):
  1. https://www.kaggle.com/datasets/rayuga2503/linkedin-company-and-member-position-dataset
  2. https://www.kaggle.com/datasets/avishek14/job-circular-dataset-for-cse-roles
  3. https://www.kaggle.com/datasets/surendra365/recruitement-dataset
  4. https://www.kaggle.com/datasets/yazeedfares/software-engineering-jobs-dataset/data
  5. https://www.kaggle.com/datasets/asaniczka/data-science-job-postings-and-skills/data
  6. https://www.kaggle.com/datasets/himelsarder/global-it-job-listings-dataset/data
  7. https://www.kaggle.com/datasets/blakelink/tech-job-postings-dataset-7-day-rolling-window
- ลักษณะที่ควรรู้: แต่ละตำแหน่งมีชุดทักษะเพียง 4 แบบ และจำนวนประกาศต่อตำแหน่งไม่สมดุล (ดูหัวข้อข้อจำกัด)
- **หมายเหตุ:** สาเหตุที่ชุดทักษะมีเพียง 4 แบบ เป็นผลมาจากโครงสร้างของชุดข้อมูลที่เรารวบรวม

## โครงสร้างโปรเจกต์
```
.
├── analysis/                    โค้ดวิเคราะห์ (Python)
│   ├── 01_clean_data.py         ทำความสะอาดข้อมูล
│   ├── 02_association_rules.py  Association Rules (Support, Confidence, Lift)
│   ├── 03_dashboard_data.py     สร้าง JSON ให้เว็บและทดสอบผลของบริษัท
│   ├── requirements.txt
│   └── data/raw/                ไฟล์ Excel ต้นฉบับ (จะไม่รวมใน repo: ขอไฟล์จากทีมหรือดาวน์โหลดตามลิงก์ที่มา)
├── public/data/                 ไฟล์ JSON ที่เว็บอ่าน (สร้างจากข้อ 03)
├── src/                         โค้ดเว็บ (React + Vite)
│   ├── pages/                   5 หน้า
│   ├── components/              NetworkGraph, SkillStacks, CompanyCheck, SkillBarChart, ...
│   ├── utils/                   โหลดข้อมูล, เก็บตำแหน่งที่เลือก, ฟังก์ชันคำนวณ
│   └── css/jobskills.css        สไตล์ของ dashboard
└── firebase.json
```

## วิธีรันการวิเคราะห์
```bash
cd analysis
py -m pip install -r requirements.txt     # (macOS/Linux: pip install -r requirements.txt)
# วางไฟล์ Combined_IT_Jobs_Dataset_v7.xlsx ไว้ใน analysis/data/raw/
py 01_clean_data.py          # data/processed/jobs_clean.csv ฯลฯ
py 02_association_rules.py   # data/processed/skill_association_rules.xlsx
py 03_dashboard_data.py      # /public/data/*.json
```
ผลที่ควรได้ (ใช้ตรวจว่ารันถูก): 107,284 แถวเท่าเดิม, ทักษะ 192 ชนิดเหลือ 182, แยกทักษะที่ติดกัน 17,014 ครั้ง, ที่ตั้งระบุประเทศไม่ได้ 2,321 แถว, กฎ {Excel, Python} → Data Analyst มี Support 12.4% Confidence 100% Lift 6.03

## วิธีรันเว็บ
```bash
npm install
npm run dev             # จะได้ลิงก์ http://localhost:5173
npm run build
firebase deploy --only hosting
```
`firebase.json` ต้องมี rewrite `** -> /index.html` เพื่อให้เปิดหน้าย่อยตรงๆ ได้

## หน้าในเว็บ
| หน้า | ตอบคำถาม |
|---|---|
| Job Skills Network | ตำแหน่งต่างๆ ใช้ทักษะร่วมหรือต่างกันอย่างไร |
| Skill Stacks | ตำแหน่งเดียวกันมีชุดทักษะต่างกันอย่างไร |
| Company Check | ความต่างมาจากบริษัทหรือไม่ |
| Top Skills | ทักษะไหนถูกระบุมากที่สุด |
| About data | ข้อจำกัดและวิธีอ่านข้อมูล |

## วิธีการ
- **ทำความสะอาด (Python/pandas, กฎที่เขียนเอง):** แยกทักษะที่ติดกัน 15 รูปแบบ (เช่น Python/JavaScript), รวมชื่อซ้ำ 7 รูปแบบ, คง TCP/IP PL/SQL HTML/CSS Cisco Routers/Switches เป็นทักษะเดียว, แยกที่ตั้งเป็นเมืองและประเทศ (ไม่ได้เดา ถ้าไม่รู้จะใส่ Unknown), ไม่ลบแถวใดเลย
- **Association Rules:** 1 ประกาศ = 1 transaction, ทักษะ = item นับกฎที่มีเงื่อนไขทักษะ 1-2 ตัว → ตำแหน่ง (Support, Confidence, Lift) ไม่ใช่ Apriori เต็มรูปแบบ
- **ความคล้ายระหว่างตำแหน่ง:** Jaccard = ทักษะร่วม ÷ ทักษะของสองตำแหน่งรวมกัน
- **ชุดทักษะ (stack):** ชุดทักษะที่ตรงกันทุกตัวในประกาศ
- **ผลของบริษัท:** chi-square test of independence (scipy) ต่อรายตำแหน่ง ใช้เฉพาะบริษัทที่มี 5 ประกาศขึ้นไปของตำแหน่งนั้น ปรับเกณฑ์แบบ Bonferroni (0.05 ÷ 22 = 0.0023)
- **เว็บ:** React, Vite, react-router-dom, D3.js (Network Graph), Firebase Hosting

## ข้อจำกัด
- ชุดทักษะตายตัว 4 ชุดต่อตำแหน่ง ผลจึงเป็นภาพของข้อมูลชุดนี้ ไม่ใช่ตลาดงานจริง
- จำนวนประกาศไม่สมดุล: 5 ตำแหน่งมี 14,900+ ประกาศ ที่เหลือ 1,103-5,591 ตัวเลขรวมถูกตำแหน่งใหญ่ครอบ
- บริษัทส่วนใหญ่ประกาศครั้งเดียว (มัธยฐาน 1) ผลทดสอบจึง "ไม่พบหลักฐานว่าบริษัทกำหนดชุดทักษะ" ซึ่งไม่เท่ากับพิสูจน์ว่าไม่เกี่ยว
- Level และ Education ทำให้ทักษะต่างกันเพียงราว 3 จุดเปอร์เซ็นต์ จึงไม่ใช้เป็นตัวกรอง
- Job Family (4 กลุ่ม) เป็นการจัดกลุ่มของผู้วิเคราะห์ ไม่ได้อยู่ในข้อมูลต้นฉบับ
- รายการแมปทักษะ เมือง และประเทศ เขียนจากการสังเกตข้อมูล ไม่ได้ตรวจกับแหล่งอ้างอิงภายนอก

## อ้างอิง
- Agrawal, R. & Srikant, R. (1994). Fast Algorithms for Mining Association Rules. VLDB.
- เอกสาร: pandas, SciPy (`chi2_contingency`), D3.js, React, Vite, Firebase Hosting
