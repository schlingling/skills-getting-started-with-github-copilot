"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "extended_description": "Build strategic thinking through guided lessons, friendly matches, and tournament preparation for players of every experience level.",
        "location": "Library, Room 204",
        "supervisor": "Mr. Robert Chen",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "extended_description": "Explore Python, web development, and collaborative problem-solving while creating practical software projects from idea to demo.",
        "location": "Computer Lab, Room 301",
        "supervisor": "Ms. Priya Patel",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "extended_description": "Improve fitness, coordination, and teamwork through rotating sports, conditioning exercises, and inclusive group challenges.",
        "location": "Main Gymnasium",
        "supervisor": "Coach Marcus Johnson",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Develop basketball skills and compete against other schools",
        "extended_description": "Practice ball handling, shooting, defense, and team strategy while preparing for friendly and interschool competitions.",
        "location": "Main Gymnasium",
        "supervisor": "Coach Elena Rodriguez",
        "schedule": "Tuesdays and Thursdays, 4:00 PM - 5:30 PM",
        "max_participants": 15,
        "participants": []
    },
    "Soccer Club": {
        "description": "Practice soccer techniques and play friendly matches",
        "extended_description": "Develop passing, dribbling, positioning, and match awareness through skill sessions and small-sided games.",
        "location": "Athletic Field",
        "supervisor": "Coach David Thompson",
        "schedule": "Mondays and Wednesdays, 4:00 PM - 5:30 PM",
        "max_participants": 18,
        "participants": []
    },
    "Art Studio": {
        "description": "Explore drawing, painting, and mixed-media projects",
        "extended_description": "Experiment with traditional and contemporary art techniques while developing a personal portfolio in a supportive studio setting.",
        "location": "Art Studio, Room 118",
        "supervisor": "Ms. Amelia Brooks",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 16,
        "participants": []
    },
    "Drama Club": {
        "description": "Develop acting skills and prepare performances for the school community",
        "extended_description": "Practice acting, improvisation, stagecraft, and ensemble work while producing performances for the school community.",
        "location": "School Auditorium",
        "supervisor": "Mr. Samuel Green",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": []
    },
    "Debate Team": {
        "description": "Research current topics and practice persuasive public speaking",
        "extended_description": "Learn structured argument, evidence-based research, rebuttal techniques, and confident public speaking for competitive debates.",
        "location": "Humanities Room 215",
        "supervisor": "Dr. Nina Williams",
        "schedule": "Tuesdays, 3:30 PM - 5:00 PM",
        "max_participants": 14,
        "participants": []
    },
    "Math Club": {
        "description": "Solve challenging problems and prepare for mathematics competitions",
        "extended_description": "Tackle creative problems, explore advanced mathematical ideas, and prepare collaboratively for regional competitions.",
        "location": "Mathematics Room 207",
        "supervisor": "Mrs. Grace Lee",
        "schedule": "Fridays, 3:30 PM - 4:30 PM",
        "max_participants": 16,
        "participants": []
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity = activities[activity_name]
    if email in activity["participants"]:
        raise HTTPException(status_code=400, detail="Student already signed up for this activity")

    if len(activity["participants"]) >= activity["max_participants"]:
        raise HTTPException(status_code=400, detail="Activity is full")

    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.delete("/activities/{activity_name}/signup")
def unregister_from_activity(activity_name: str, email: str):
    """Unregister a student from an activity"""
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity = activities[activity_name]
    if email not in activity["participants"]:
        raise HTTPException(status_code=404, detail="Student is not signed up for this activity")

    activity["participants"].remove(email)
    return {"message": f"Unregistered {email} from {activity_name}"}
