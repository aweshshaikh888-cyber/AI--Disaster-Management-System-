import datetime
from app.database.session import SessionLocal, Base, engine
from app.database.models import (
    User, Incident, IncidentTimeline, AIAnalysis, RescueTeam,
    HospitalShelter, EmergencyResource, EmergencyNotification,
    WeatherAlert, AuditLog, ModelMetrics
)
from app.core.security import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Users
    if db.query(User).count() == 0:
        users = [
            User(
                username="admin_commander",
                email="admin@disasterai.gov",
                hashed_password=hash_password("DemoPass2026!"),
                role="ADMIN",
                full_name="Major General R. Sharma",
                agency="National Disaster Management Authority (HQ)",
                badge_number="NDMA-HQ-001"
            ),
            User(
                username="officer_ops",
                email="officer@disasterai.gov",
                hashed_password=hash_password("DemoPass2026!"),
                role="OFFICER",
                full_name="Captain Priya Patel",
                agency="Emergency Operations Center",
                badge_number="EOC-OPS-042"
            ),
            User(
                username="rescue_unit9",
                email="rescue@disasterai.gov",
                hashed_password=hash_password("DemoPass2026!"),
                role="RESCUE",
                full_name="Lt. David Vance",
                agency="Urban Search & Rescue (USAR Unit 9)",
                badge_number="USAR-FLD-109"
            ),
            User(
                username="analyst_geoint",
                email="analyst@disasterai.gov",
                hashed_password=hash_password("DemoPass2026!"),
                role="ANALYST",
                full_name="Dr. Aisha Rao",
                agency="Geospatial Intelligence Division",
                badge_number="GEO-AI-314"
            )
        ]
        db.add_all(users)
        db.commit()

    # 2. Incidents
    if db.query(Incident).count() == 0:
        incidents = [
            Incident(
                incident_code="DIS-2026-001",
                title="Sector 4 Commercial Plaza Structural Collapse",
                disaster_type="Building Collapse",
                severity="Critical Damage",
                status="Response Initiated",
                description="Multi-story commercial arcade suffered catastrophic structural pancake collapse following foundation subsidence. High probability of trapped civilian occupants.",
                location_name="Connaught Outer Ring, Sector 4, New Delhi",
                latitude=28.6328,
                longitude=77.2197,
                priority_score=94.5,
                priority_category="Critical",
                affected_people_est=85,
                critical_infra_affected=True,
                medical_emergency=True,
                reported_by="Municipal Emergency Dispatch",
                reporter_contact="+91-11-2334-0011",
                assigned_officer="Captain Priya Patel",
                is_verified=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),
            Incident(
                incident_code="DIS-2026-002",
                title="Yamuna River Low-Lying Basin Flash Flood Surge",
                disaster_type="Flood",
                severity="Severe Damage",
                status="Response Initiated",
                description="Rapid monsoon surge elevated river levels 2.4 meters past danger threshold. Ground-floor residential dwellings inundated; electricity sub-station compromised.",
                location_name="Mayur Vihar Extension / Yamuna Khadar",
                latitude=28.6045,
                longitude=77.2950,
                priority_score=82.0,
                priority_category="Critical",
                affected_people_est=220,
                critical_infra_affected=True,
                medical_emergency=False,
                reported_by="Flood Control Cell",
                reporter_contact="+91-11-2244-8899",
                assigned_officer="Captain Priya Patel",
                is_verified=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
            ),
            Incident(
                incident_code="DIS-2026-003",
                title="Industrial Warehouse Chemical Solvent Fire",
                disaster_type="Fire",
                severity="Severe Damage",
                status="Confirmed",
                description="Storage warehouse fire involving combustible polymer drums. Toxic black smoke plume dispersing over surrounding 1.5km residential zone.",
                location_name="Okhla Phase II Industrial Area",
                latitude=28.5305,
                longitude=77.2711,
                priority_score=78.5,
                priority_category="High",
                affected_people_est=45,
                critical_infra_affected=False,
                medical_emergency=True,
                reported_by="Industrial Security Post",
                reporter_contact="+91-11-2681-3322",
                assigned_officer="Lt. David Vance",
                is_verified=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
            ),
            Incident(
                incident_code="DIS-2026-004",
                title="Hillside Retaining Wall Failure & Mudslide",
                disaster_type="Landslide",
                severity="Moderate Damage",
                status="Under Review",
                description="Heavy precipitation triggered embankment shear failure. 400 metric tons of mud and boulders blocking secondary bypass artery.",
                location_name="Northern Ridge Escarpment Highway",
                latitude=28.6850,
                longitude=77.2080,
                priority_score=58.0,
                priority_category="Medium",
                affected_people_est=12,
                critical_infra_affected=True,
                medical_emergency=False,
                reported_by="Highway Patrol Unit",
                reporter_contact="+91-11-2766-1020",
                is_verified=True,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=9)
            ),
            Incident(
                incident_code="DIS-2026-005",
                title="Residential Colony Minor Masonry Cracks Post-Tremor",
                disaster_type="Earthquake",
                severity="Low Damage",
                status="Reported",
                description="Minor hairline plaster cracking on 4 residential terrace parapets following 4.2 magnitude regional tremor. No foundation shifts observed.",
                location_name="Vasant Kunj Sector B Block",
                latitude=28.5244,
                longitude=77.1495,
                priority_score=32.0,
                priority_category="Low",
                affected_people_est=0,
                critical_infra_affected=False,
                medical_emergency=False,
                reported_by="Resident Welfare Association",
                reporter_contact="+91-98110-44321",
                is_verified=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
            ),
            Incident(
                incident_code="DIS-2026-006",
                title="Telecom Relay Tower Wind Gust Deflection",
                disaster_type="Cyclone",
                severity="Moderate Damage",
                status="Reported",
                description="Extreme 65 km/h squall winds caused tension guy-wire slippage on regional telecommunications relay mast.",
                location_name="Janakpuri West Sector 1",
                latitude=28.6219,
                longitude=77.0878,
                priority_score=48.0,
                priority_category="Medium",
                affected_people_est=0,
                critical_infra_affected=True,
                medical_emergency=False,
                reported_by="Telecom Infrastructure Operator",
                reporter_contact="+91-99100-88776",
                is_verified=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=18)
            )
        ]
        db.add_all(incidents)
        db.commit()

        # Add timelines
        for inc in db.query(Incident).all():
            tl = IncidentTimeline(
                incident_id=inc.id,
                action="Incident Initial Intake",
                notes=f"Emergency call received. Initial severity classified as '{inc.severity}' with Priority Score {inc.priority_score}.",
                author="System Auto-Dispatcher"
            )
            db.add(tl)
        db.commit()

    # 3. Rescue Teams
    if db.query(RescueTeam).count() == 0:
        teams = [
            RescueTeam(
                name="USAR Strike Alpha (Unit 9)",
                specialization="Urban Search & Rescue (USAR)",
                lead_name="Lt. David Vance",
                contact_phone="+91-98711-22334",
                member_count=12,
                status="On Site",
                latitude=28.6315,
                longitude=77.2180,
                equipment_summary="Acoustic life-detector rods, pneumatic shoring struts, hydraulic cutters, search cameras",
                vehicle_info="1 Heavy Shoring Truck, 2 Tactical 4x4 Troop Carriers"
            ),
            RescueTeam(
                name="Rapid Medical Triage Team 3",
                specialization="Medical First Response & Advanced Triage",
                lead_name="Dr. Sunita Deshmukh",
                contact_phone="+91-98711-55443",
                member_count=8,
                status="En Route",
                latitude=28.6250,
                longitude=77.2210,
                equipment_summary="Field trauma stabilization kits, portable ventilators, defibrillators, emergency IV plasma",
                vehicle_info="3 Advanced Life Support (ALS) Ambulances"
            ),
            RescueTeam(
                name="K-9 Disaster Scent Search Cadre",
                specialization="Canine Scent Detection & Live Victim Locating",
                lead_name="Inspector Vikram Rana",
                contact_phone="+91-98711-99887",
                member_count=6,
                status="On Site",
                latitude=28.6330,
                longitude=77.2205,
                equipment_summary="4 Certified Belgian Malinois Search Dogs, GPS telemetry collars, canine trauma packs",
                vehicle_info="2 Climate-Controlled K9 Search Transporters"
            ),
            RescueTeam(
                name="Riverine High-Water Rescue Flotilla",
                specialization="Flood & Water Rescue",
                lead_name="Commander Arun Nair",
                contact_phone="+91-98711-66778",
                member_count=14,
                status="En Route",
                latitude=28.6030,
                longitude=77.2910,
                equipment_summary="4 Zodiac inflatable motorized boats, swiftwater throw bags, dry-suits, high-buoyancy life vests",
                vehicle_info="2 Boat Trailer Rigs, 1 Mobile Decontamination Unit"
            ),
            RescueTeam(
                name="Hazmat & Chemical Hazard Squad",
                specialization="Hazmat Containment & Decontamination",
                lead_name="Specialist Karen Holt",
                contact_phone="+91-98711-33221",
                member_count=7,
                status="Available",
                latitude=28.5350,
                longitude=77.2680,
                equipment_summary="Level-A gas-tight suits, multi-gas spectrometry meters, chemical neutralizing foams",
                vehicle_info="1 Hazmat Response Van"
            ),
            RescueTeam(
                name="Heavy Engineering & Clearance Corps",
                specialization="Debris Removal & Roadway Breaching",
                lead_name="Eng. Rajesh Verma",
                contact_phone="+91-98711-11009",
                member_count=10,
                status="Available",
                latitude=28.6810,
                longitude=77.2020,
                equipment_summary="Excavators, hydraulic rock-breakers, heavy winch cranes, industrial clearing blades",
                vehicle_info="2 JCB Heavy Earthmovers, 1 20-Ton Crane"
            )
        ]
        db.add_all(teams)
        db.commit()

    # 4. Facilities (Hospitals & Shelters)
    if db.query(HospitalShelter).count() == 0:
        facilities = [
            HospitalShelter(
                name="All India Institute of Medical Sciences (AIIMS Trauma Center)",
                facility_type="Hospital",
                address="Ring Road, Ansari Nagar East, New Delhi",
                latitude=28.5672,
                longitude=77.2100,
                contact_phone="+91-11-2658-8500",
                total_capacity=450,
                available_capacity=68,
                services="Level-1 Trauma, Burn ICU, Neuro-Surgery, Helicopter Landing Pad",
                is_verified=True,
                status="Operational"
            ),
            HospitalShelter(
                name="Dr. Ram Manohar Lohia Hospital Emergency Wing",
                facility_type="Hospital",
                address="Baba Kharak Singh Marg, Connaught Place",
                latitude=28.6251,
                longitude=77.2012,
                contact_phone="+91-11-2336-5525",
                total_capacity=300,
                available_capacity=42,
                services="Emergency Trauma, General Surgery, Pediatric Care, 24/7 Blood Bank",
                is_verified=True,
                status="Operational"
            ),
            HospitalShelter(
                name="Safdarjung Hospital Emergency Care Complex",
                facility_type="Hospital",
                address="Opposite AIIMS, Sri Aurobindo Marg",
                latitude=28.5701,
                longitude=77.2078,
                contact_phone="+91-11-2616-5060",
                total_capacity=380,
                available_capacity=55,
                services="Mass Casualty Triage, Burn Center, Orthopedics, Rapid Diagnostics",
                is_verified=True,
                status="Operational"
            ),
            HospitalShelter(
                name="Thyagaraj Indoor Sports Complex Disaster Shelter",
                facility_type="Temporary Shelter",
                address="INA Colony, Thyagaraj Stadium Complex",
                latitude=28.5794,
                longitude=77.2185,
                contact_phone="+91-11-2462-8800",
                total_capacity=1200,
                available_capacity=840,
                services="Dry cots, drinking water filtration, community kitchen, sanitation facilities",
                is_verified=True,
                status="Operational"
            ),
            HospitalShelter(
                name="Yamuna Sports Complex Emergency Relief Camp",
                facility_type="Relief Camp",
                address="Surajmal Vihar, East Delhi",
                latitude=28.6601,
                longitude=77.3090,
                contact_phone="+91-11-2216-4433",
                total_capacity=900,
                available_capacity=310,
                services="Temporary housing, hot meals, infant care kits, psychological support desk",
                is_verified=True,
                status="Operational"
            )
        ]
        db.add_all(facilities)
        db.commit()

    # 5. Resources
    if db.query(EmergencyResource).count() == 0:
        resources = [
            EmergencyResource(name="Advanced Life Support Ambulances", category="Vehicles", total_quantity=24, available_quantity=14, unit="vehicles", warehouse_location="Central Fleet Depot", min_threshold=6),
            EmergencyResource(name="Urban Search Hydraulic Cutters", category="Rescue Gear", total_quantity=50, available_quantity=32, unit="units", warehouse_location="USAR Equipment Depot", min_threshold=10),
            EmergencyResource(name="Emergency Trauma Blood Plasma Kits", category="Medical", total_quantity=500, available_quantity=180, unit="kits", warehouse_location="Red Cross Regional Blood Bank", min_threshold=100),
            EmergencyResource(name="Zodiac Inflatable Rescue Boats", category="Vehicles", total_quantity=18, available_quantity=8, unit="boats", warehouse_location="Riverine Logistics Dock", min_threshold=5),
            EmergencyResource(name="Pre-Packaged Rations & Drinking Water", category="Food & Water", total_quantity=5000, available_quantity=3200, unit="cartons", warehouse_location="Civil Supplies Depot 3", min_threshold=800),
            EmergencyResource(name="Heavy Duty Diesel Water Pumps (100 HP)", category="Rescue Gear", total_quantity=30, available_quantity=9, unit="pumps", warehouse_location="Drainage & Flood Warehouse", min_threshold=8),
            EmergencyResource(name="Emergency Family All-Weather Tents", category="Shelter", total_quantity=800, available_quantity=450, unit="tents", warehouse_location="Disaster Relief Logistics Center", min_threshold=150),
            EmergencyResource(name="Mobile Satellite Uplink Communications Units", category="Rescue Gear", total_quantity=12, available_quantity=7, unit="units", warehouse_location="HQ Comms Reserve", min_threshold=3)
        ]
        db.add_all(resources)
        db.commit()

    # 6. Notifications
    if db.query(EmergencyNotification).count() == 0:
        notifs = [
            EmergencyNotification(
                title="CRITICAL: Sector 4 Building Collapse Cordon Established",
                message="Authorized personnel only within 100 meters of Plaza 4. High secondary vibration risk from heavy transport.",
                severity="Critical Evacuation",
                target_channel="Multi-Channel (In-App + SMS + Siren)",
                target_region="Sector 4 & Connaught Periphery",
                is_test_mode=False,
                sent_by="Major General R. Sharma",
                acknowledged=True,
                recipients_count=1850,
                delivery_status="Delivered (100%)",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),
            EmergencyNotification(
                title="ADVISORY: River Yamuna Khadar Water Inundation",
                message="Low-lying settlements advised to commence orderly voluntary relocation to Thyagaraj Stadium shelter.",
                severity="Warning",
                target_channel="SMS & Public Megaphone Relay",
                target_region="East Delhi Floodplain",
                is_test_mode=False,
                sent_by="Captain Priya Patel",
                acknowledged=True,
                recipients_count=3400,
                delivery_status="Delivered (98.4%)",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
            )
        ]
        db.add_all(notifs)
        db.commit()

    # 7. Weather Alerts
    if db.query(WeatherAlert).count() == 0:
        walerts = [
            WeatherAlert(
                location="Delhi NCR Basin",
                weather_condition="Monsoon Trough Deep Depression",
                temperature=26.8,
                wind_speed_kmh=52.0,
                humidity=92.0,
                rainfall_mm=88.4,
                risk_level="High Risk",
                warning_title="Heavy Rainfall & Flash Flood Red Advisory",
                official_advisory="India Meteorological Department (IMD) warning: Sustained heavy precipitation expected over next 18 hours. Urban drainage choke points may overflow.",
                is_authoritative=True,
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
            ),
            WeatherAlert(
                location="Northern Escarpment Sector",
                weather_condition="Gale Squall & Rain",
                temperature=24.2,
                wind_speed_kmh=68.5,
                humidity=89.0,
                rainfall_mm=62.0,
                risk_level="Moderate Risk",
                warning_title="High Wind & Slope Instability Cautionary Bulletin",
                official_advisory="Unstable hill slopes susceptible to debris slip under continued saturated soil moisture conditions.",
                is_authoritative=True,
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
            )
        ]
        db.add_all(walerts)
        db.commit()

    # 8. Audit logs
    if db.query(AuditLog).count() == 0:
        logs = [
            AuditLog(username="admin_commander", action="SYSTEM_INITIALIZE", entity_type="System", details="DisasterAI platform initialized with operational database schema.", timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=12)),
            AuditLog(username="officer_ops", action="INCIDENT_CREATE", entity_type="Incident", entity_id="DIS-2026-001", details="Sector 4 Commercial Plaza collapse incident confirmed and prioritized.", timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2)),
            AuditLog(username="officer_ops", action="TEAM_DISPATCH", entity_type="RescueTeam", entity_id="1", details="USAR Strike Alpha dispatched to Sector 4 incident.", timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=45))
        ]
        db.add_all(logs)
        db.commit()

    db.close()
    print("Database seeded successfully with operational disaster records!")

if __name__ == "__main__":
    seed_database()
