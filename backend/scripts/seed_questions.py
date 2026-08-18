"""
One-time script to seed the 10 core survey questions for study_id = 1.
Run with: python -m scripts.seed_questions
"""

from app.core.database import SessionLocal
from app.models.question import Question

STUDY_ID = 1

QUESTIONS = [
    {
        "question_text": "What is your organization's approximate monthly cloud spend?",
        "question_type": "single_select",
        "category": "Cost Profile",
        "options": ["<$10k", "$10k-$50k", "$50k-$200k", "$200k-$1M", "$1M+"],
        "required": True,
        "allow_other": False,
        "weight": 1.0,
        "analysis_dimension": "Cost Profile",
        "display_order": 1,
    },
    {
        "question_text": "Which cloud providers does your organization currently use?",
        "question_type": "multi_select",
        "category": "Cloud Usage",
        "options": ["AWS", "Azure", "GCP", "Oracle Cloud", "IBM Cloud", "Other"],
        "required": True,
        "allow_other": True,
        "weight": 1.0,
        "analysis_dimension": "Cloud Usage",
        "display_order": 2,
    },
    {
        "question_text": "What percentage of your cloud spend do you believe is unnecessary or could be optimized?",
        "question_type": "percentage_range",
        "category": "Optimization Maturity",
        "options": ["0-10%", "10-25%", "25-50%", "50%+"],
        "required": True,
        "allow_other": False,
        "weight": 1.2,
        "analysis_dimension": "Optimization Maturity",
        "display_order": 3,
    },
    {
        "question_text": "What are the biggest contributors to your cloud bill?",
        "question_type": "multi_select",
        "category": "Cost Profile",
        "options": [
            "Compute", "Storage", "Databases", "Networking / Data transfer",
            "AI/ML services", "Other",
        ],
        "required": True,
        "allow_other": True,
        "weight": 1.0,
        "analysis_dimension": "Cost Profile",
        "display_order": 4,
    },
    {
        "question_text": "How frequently does your organization review cloud costs and usage?",
        "question_type": "single_select",
        "category": "Optimization Maturity",
        "options": ["Daily", "Weekly", "Monthly", "Quarterly", "Rarely"],
        "required": True,
        "allow_other": False,
        "weight": 1.0,
        "analysis_dimension": "Optimization Maturity",
        "display_order": 5,
    },
    {
        "question_text": "Which cloud cost optimization practices are currently being used?",
        "question_type": "multi_select",
        "category": "Optimization Maturity",
        "options": [
            "Rightsizing", "Autoscaling", "Reserved instances", "Savings plans",
            "Shutting down idle resources", "Storage tiering", "Other",
        ],
        "required": True,
        "allow_other": True,
        "weight": 1.2,
        "analysis_dimension": "Optimization Maturity",
        "display_order": 6,
    },
    {
        "question_text": "What are the biggest challenges preventing your organization from reducing cloud costs?",
        "question_type": "multi_select",
        "category": "Pain Points",
        "options": [
            "Lack of visibility", "Technical complexity", "Fear of performance impact",
            "Lack of ownership", "Insufficient tooling", "Other",
        ],
        "required": True,
        "allow_other": True,
        "weight": 1.3,
        "analysis_dimension": "Pain Points",
        "display_order": 7,
    },
    {
        "question_text": "How confident are you that your organization can accurately identify unused or underutilized cloud resources?",
        "question_type": "scale",
        "category": "Optimization Maturity",
        "options": ["1", "2", "3", "4", "5"],
        "required": True,
        "allow_other": False,
        "weight": 1.1,
        "analysis_dimension": "Optimization Maturity",
        "display_order": 8,
    },
    {
        "question_text": "Who is primarily responsible for monitoring and optimizing cloud costs in your organization?",
        "question_type": "single_select",
        "category": "Optimization Maturity",
        "options": [
            "Cloud/DevOps", "FinOps", "Engineering", "Finance", "IT",
            "Shared responsibility",
        ],
        "required": True,
        "allow_other": False,
        "weight": 1.0,
        "analysis_dimension": "Optimization Maturity",
        "display_order": 9,
    },
    {
        "question_text": "Which type of cloud cost optimization solution would provide the most value to your organization?",
        "question_type": "multi_select",
        "category": "Desired Solutions",
        "options": [
            "Cost dashboard", "Anomaly detection", "Recommendations",
            "Automated optimization", "Forecasting", "Budgeting/alerts", "Other",
        ],
        "required": True,
        "allow_other": True,
        "weight": 1.2,
        "analysis_dimension": "Desired Solutions",
        "display_order": 10,
    },
    {
        "question_text": "Your organization discovers that its monthly cloud bill has increased by 30% compared with the previous month. What would you do first?",
        "question_type": "scenario",
        "category": "Pain Points",
        "options": [
            "Investigate usage and billing metrics",
            "Identify newly created resources",
            "Check for idle/underutilized resources",
            "Review data transfer/networking costs",
            "Check for pricing-plan changes",
            "Contact the cloud provider",
            "Wait until the next billing review",
            "Other",
        ],
        "required": True,
        "allow_other": True,
        "weight": 1.3,
        "analysis_dimension": "Pain Points",
        "display_order": 11,
    },
    {
        "question_text": "What is the single biggest cloud-cost problem your organization is currently facing?",
        "question_type": "text",
        "category": "Pain Points",
        "options": None,
        "required": True,
        "allow_other": False,
        "weight": 1.5,
        "analysis_dimension": "Pain Points",
        "display_order": 12,
    },
]


def run():
    db = SessionLocal()
    try:
        deleted = (
            db.query(Question)
            .filter(Question.study_id == STUDY_ID)
            .delete()
        )
        print(f"Deleted {deleted} existing question(s) for study_id={STUDY_ID}")

        for q in QUESTIONS:
            db.add(Question(study_id=STUDY_ID, **q))

        db.commit()
        print(f"Inserted {len(QUESTIONS)} questions for study_id={STUDY_ID}")
    finally:
        db.close()


if __name__ == "__main__":
    run()