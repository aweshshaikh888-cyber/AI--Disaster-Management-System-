from typing import Dict, Any

class DisasterPriorityEngine:
    """
    Transparent Multi-Factor Incident Prioritization Engine (0 to 100):
    Supports human-in-the-loop disaster coordination.
    """
    
    DEFAULT_WEIGHTS = {
        "damage_severity": 0.35,
        "affected_population": 0.25,
        "critical_infrastructure": 0.15,
        "medical_emergency": 0.15,
        "recency": 0.10
    }
    
    SEVERITY_SCORES = {
        "No Damage": 5.0,
        "Low Damage": 25.0,
        "Moderate Damage": 50.0,
        "Severe Damage": 80.0,
        "Critical Damage": 100.0
    }
    
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        
    def calculate_priority(
        self,
        severity: str,
        affected_people: int = 0,
        critical_infra: bool = False,
        medical_emergency: bool = False,
        hours_elapsed: float = 1.0
    ) -> Dict[str, Any]:
        """
        Calculate priority score and transparent breakdown:
        Returns priority_score (0-100), category, and factor breakdown.
        """
        # 1. Damage Severity Component (0-100)
        sev_score = self.SEVERITY_SCORES.get(severity, 40.0)
        
        # 2. Affected Population Component (0-100, logarithmic scaling)
        if affected_people <= 0:
            pop_score = 10.0
        elif affected_people < 20:
            pop_score = 30.0
        elif affected_people < 100:
            pop_score = 60.0
        elif affected_people < 500:
            pop_score = 85.0
        else:
            pop_score = 100.0
            
        # 3. Critical Infrastructure Component (0 or 100)
        infra_score = 100.0 if critical_infra else 15.0
        
        # 4. Medical Emergency Component (0 or 100)
        med_score = 100.0 if medical_emergency else 20.0
        
        # 5. Recency / Escalation Component (Fresh incidents get higher urgency)
        recency_score = max(20.0, 100.0 - (hours_elapsed * 5.0))
        
        # Weighted aggregate
        total_score = (
            (sev_score * self.weights["damage_severity"]) +
            (pop_score * self.weights["affected_population"]) +
            (infra_score * self.weights["critical_infrastructure"]) +
            (med_score * self.weights["medical_emergency"]) +
            (recency_score * self.weights["recency"])
        )
        total_score = round(min(100.0, max(0.0, total_score)), 1)
        
        # Priority Category
        if total_score >= 80.0:
            category = "Critical"
            urgency = "IMMEDIATE (0 - 30 minutes)"
            recommended_units = "USAR Heavy Unit, 2+ Ambulances, Hazmat Protocol"
        elif total_score >= 60.0:
            category = "High"
            urgency = "URGENT (30 - 60 minutes)"
            recommended_units = "Rapid Response Team, 1 Ambulance, Shoring Gear"
        elif total_score >= 40.0:
            category = "Medium"
            urgency = "STANDARD (1 - 4 hours)"
            recommended_units = "Inspection Squad, Basic Relief Transport"
        else:
            category = "Low"
            urgency = "MONITORING / ROUTINE (4 - 12 hours)"
            recommended_units = "Field Assessment Officer"
            
        return {
            "priority_score": total_score,
            "category": category,
            "response_urgency": urgency,
            "recommended_units": recommended_units,
            "breakdown": {
                "damage_severity_contribution": round(sev_score * self.weights["damage_severity"], 1),
                "affected_population_contribution": round(pop_score * self.weights["affected_population"], 1),
                "critical_infrastructure_contribution": round(infra_score * self.weights["critical_infrastructure"], 1),
                "medical_emergency_contribution": round(med_score * self.weights["medical_emergency"], 1),
                "recency_contribution": round(recency_score * self.weights["recency"], 1)
            },
            "formula_explanation": "Score = (Severity×0.35) + (Population×0.25) + (Infra×0.15) + (Medical×0.15) + (Recency×0.10)"
        }

priority_engine = DisasterPriorityEngine()
