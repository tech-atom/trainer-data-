# ATOM Trainer Hub

Build an Internal Trainer Management Platform for ATOM

1. Project Overview

Build a modern, responsive internal web application called:

ATOM Trainer Hub

The purpose of this platform is to maintain a centralized database of all trainers associated with ATOM.

Currently, trainer information is scattered across different files, folders, WhatsApp chats, emails, and documents. When a new training project comes in, the team needs to quickly identify suitable trainers based on technical skills, soft skills, location, experience, availability, and other requirements.

The application should solve this problem by creating a centralized searchable Trainer Database.

Core workflow

When ATOM receives a project requirement such as:

"We need 3 Java trainers with 5+ years of experience for a 10-day training program in Bangalore."

The admin should be able to search:

Java

and immediately see all relevant trainers.

The admin should then be able to filter the results by:

Experience

Location

Trainer type

Availability

Mode of training

Technical skills

Soft skills

Industry experience

College/university experience

Rating

Previous ATOM projects

From the trainer card, the admin should be able to:

Open complete trainer profile

View profile photo

View all skills

View experience

View previous projects

View education

View certifications

View trainer CV/profile PDF

Download CV

Call trainer

WhatsApp trainer

Email trainer

Check availability

View notes

View documents

2. Technology Stack

Build the application using:

Frontend

React / Next.js

TypeScript

Tailwind CSS

Modern responsive UI

Component-based architecture

Backend

Django + Django REST Framework

Database

PostgreSQL

Authentication

Secure login

Role-based access control

File Storage

Support uploading:

PDF

DOC/DOCX

Images

Certificates

Resume/CV

Other trainer documents

3. User Roles

Create the following roles.

Admin

Full access.

Admin can:

Add trainers

Edit trainers

Delete/deactivate trainers

Search trainers

Filter trainers

Upload documents

Download CVs

Add skills

Add projects

Track trainer availability

Add internal notes

View contact details

Call trainer

WhatsApp trainer

View activity history

Export trainer data

Manager / HR

Can:

Search trainers

View profiles

Contact trainers

Upload/update documents

Update availability

Add project experience

Add notes

But cannot permanently delete trainers.

Viewer

Read-only access.

Can:

Search trainers

View trainer profiles

View CV

Contact trainers

4. Dashboard

Create a professional ATOM dashboard.

Dashboard should display:

Summary Cards

Total Trainers

Active Trainers

Available Trainers

Trainers Added This Month

Trainers by Technology

Trainers by Location

Trainers Currently Assigned

Trainers Available for New Projects

Charts

Create useful charts such as:

Trainers by skill

Trainers by location

Trainers by experience

Technical vs Non-Technical trainers

Available vs unavailable trainers

Trainers by training domain

5. Trainer Database

Create a main page called:

Trainer Directory

This is the most important page.

At the top provide a large global search box:

Search Trainer by:

Name

Skill

Technology

Location

Experience

Certification

Qualification

Previous project

College

Company

Industry

Keywords

Example:

Search:

Python

Results should display all trainers who have Python in their skills, experience, expertise, certifications, previous projects, or profile information.

Search:

Java Spring Boot

should return trainers with matching Java/Spring Boot expertise.

Search:

Bangalore

should return trainers available or located in Bangalore.

Search should support partial and keyword matching.

6. Advanced Search and Filters

Create an advanced filter panel.

Filters:

Skills

Examples:

Python

Java

C

C++

JavaScript

React

Angular

Node.js

MERN

MEAN

SQL

Data Science

Machine Learning

AI

Cloud

AWS

Azure

DevOps

Cybersecurity

VLSI

Embedded Systems

MATLAB

Simulink

AutoCAD

CATIA

SolidWorks

GD&T

Aptitude

Soft Skills

Communication

Leadership

Interview Skills

Skills must be dynamically manageable by Admin.

Experience

0–2 years

3–5 years

5–10 years

10+ years

Location

City

State

Country

Training Mode

Online

Offline

Hybrid

Trainer Type

Technical Trainer

Soft Skills Trainer

Aptitude Trainer

Domain Expert

Industry Expert

Guest Faculty

Freelance Trainer

Full-time Trainer

Availability

Available

Partially Available

Assigned

Unavailable

Previous Experience

Filter by:

College

University

Corporate

School

Government project

Industry

7. Trainer Card

Display trainers as clean cards.

Each card should contain:

Profile photo

Trainer name

Primary designation

Primary skills

Years of experience

Location

Trainer type

Availability status

Rating

Number of projects completed

Example:

PHOTO

Rahul Sharma

Senior Java Trainer

Java | Spring Boot | DSA | SQL

8 Years Experience

Bangalore

🟢 Available

Projects: 24

[View Profile]

[Call] [WhatsApp]

The Call and WhatsApp buttons should work directly on mobile.

8. Complete Trainer Profile

Clicking "View Profile" should open a detailed trainer profile.

Create sections:

Personal Information

Full Name

Profile Photo

Date of Birth

Gender

Phone Number

WhatsApp Number

Email

Alternate Phone

Address

City

State

Country

Professional Information

Current Designation

Current Organization

Total Experience

Training Experience

Industry Experience

Years as Trainer

Trainer Type

Employment Type

Skills

Display skills as tags.

Example:

Python
Django
Machine Learning
Data Science
SQL
Pandas
NumPy
TensorFlow

Each skill should have a proficiency level:

Beginner

Intermediate

Advanced

Expert

Education

Degree

Specialization

University

Year

Allow multiple education records.

Certifications

Certification Name

Issuing Organization

Certificate ID

Issue Date

Expiry Date

Certificate document

Training Experience

For each previous training:

Client / College

Program Name

Technology

Number of Students

Duration

Location

Training Mode

Year

Feedback / Rating

Previous Projects

Display all ATOM projects handled by the trainer.

Fields:

Project Name

Client

Technology

Duration

Batch Size

Location

Role

Year

Feedback

Rating

Availability

Display:

Current Status

Available From

Available Until

Preferred Locations

Preferred Training Mode

Maximum training hours per day

Maximum training days per month

Documents

Upload and manage:

CV

Profile PDF

Aadhaar / ID if legally appropriate and access-controlled

Certifications

Experience letters

Other documents

Documents must have proper access permissions.

9. CV / Profile PDF

Every trainer should have a downloadable profile PDF.

Add buttons:

View CV

Download CV

The system should allow Admin to upload the trainer's existing CV/Profile PDF.

Optionally provide a "Generate Trainer Profile PDF" feature using the information stored in the database.

The generated PDF should contain:

ATOM branding

Trainer photo

Professional summary

Skills

Experience

Education

Certifications

Training experience

Projects

Contact information

10. Call Feature

On every trainer profile and trainer card provide:

Call Trainer

When clicked:

tel:+91XXXXXXXXXX

This should open the phone dialer on supported devices.

Do not expose sensitive contact information to unauthorized users.

11. WhatsApp Feature

Provide:

WhatsApp Trainer

button.

When clicked, open WhatsApp using the trainer's registered WhatsApp number.

Example behavior:

https://wa.me/<countrycode><number>

Allow an optional predefined message.

Example:

"Hi Rahul, this is ATOM. We have a Java training requirement. Are you available for this project?"

The message should be configurable.

12. Email Feature

Add:

Email Trainer

Clicking it should open the default email application.

Example:

Subject:

ATOM Training Requirement – Java Trainer

13. Trainer Availability

Create a dedicated availability system.

Each trainer should have:

Status

🟢 Available

🟡 Partially Available

🔴 Unavailable

Availability Calendar

Admin should be able to enter:

Start date

End date

Project

Location

Number of days

Daily training hours

Example:

Trainer:

Rahul Sharma

Status:

🟡 Partially Available

Available:

15 September – 30 September

Location:

Bangalore

Mode:

Offline

14. Project Requirement Module

This is an important feature.

Create:

Project Requirements

Admin can create a requirement such as:

Project:

Java Full Stack Training

Client:

ABC University

Required Skills:

Java
Spring Boot
SQL
DSA

Location:

Bangalore

Mode:

Offline

Duration:

10 Days

Required Trainers:

3

Minimum Experience:

5 Years

Start Date:

20 September 2026

Once created, provide:

Find Matching Trainers

The system should automatically search the trainer database.

15. Smart Trainer Matching

Create a trainer matching algorithm.

Example:

Requirement:

Java + Spring Boot + DSA
5+ years experience
Bangalore
Offline
Available from 20 September

The system should rank trainers based on:

Skill match

Experience

Availability

Location

Training mode

Previous project experience

Trainer rating

Display:

Best Matches

1. Rahul Sharma – 94% Match

Java ✓
Spring Boot ✓
DSA ✓
8 Years ✓
Bangalore ✓
Available ✓
Offline ✓

[View Profile] [Call] [WhatsApp]

16. Trainer Rating

After every project, Admin/Manager can provide a rating.

Fields:

Technical Knowledge

Communication

Student Engagement

Punctuality

Content Quality

Overall Rating

Use 1–5 stars.

Also allow comments.

Display:

Overall Rating: 4.7 / 5

Projects Completed: 32

17. Trainer Notes

Create an internal notes section.

Examples:

"Excellent for Java DSA programs."

"Prefers Bangalore projects."

"Available only on weekends."

"Strong student engagement."

"Do not assign for beginner-level programs."

Notes must be internal and should not appear on publicly shared trainer profiles.

18. Trainer Documents

Create a document management section.

Each trainer can have:

CV

Profile PDF

Certificates

Experience Letters

ID Documents

Training Feedback

Other Documents

Display:

Document Name
Document Type
Uploaded Date
Uploaded By
View
Download
Delete

Restrict sensitive documents to authorized roles.

19. Import Trainers

Provide bulk trainer import.

Admin should be able to upload:

Excel

CSV

Import fields such as:

Name
Phone
WhatsApp
Email
Location
Experience
Skills
Designation
Organization
Trainer Type
Availability

Provide validation before importing.

Show:

Records imported

Records failed

Duplicate records

Missing information

20. Export Trainers

Allow Admin to export filtered trainer data.

Formats:

Excel

CSV

PDF

Example:

Search:

Python

Location:

Bangalore

Experience:

5+ years

Then:

Export Results

21. Duplicate Detection

When adding a trainer, detect possible duplicates based on:

Phone number

Email

Name + phone

Name + email

Show warning:

"Possible duplicate trainer found."

Allow Admin to review before saving.

22. Activity History

Track important actions.

Example:

Admin added trainer.

Admin updated trainer skills.

Admin downloaded CV.

Manager contacted trainer.

Admin changed availability.

Admin assigned trainer to project.

Display:

Activity Timeline

23. Global Search

Create a global search across the entire trainer database.

Search terms should match:

Name

Skills

Certifications

Education

Previous projects

Organizations

Colleges

Technologies

Locations

Notes where permitted

Example:

Searching:

Python

could return:

Python trainers

Django trainers

Data Science trainers

Machine Learning trainers

Trainers with Python project experience

Highlight matching keywords.

24. Skill Management

Create an Admin page:

Manage Skills

Admin can:

Add skill

Edit skill

Delete skill

Create skill categories

Add aliases

Example:

Skill:

JavaScript

Aliases:

JS
ECMAScript

Skill:

Machine Learning

Aliases:

ML
Machine Learning

This improves search accuracy.

25. Trainer Status

Use:

Active

Inactive

Blacklisted

Archived

Do not permanently delete trainers by default.

Use soft deletion / archival.

26. Security

Implement proper security.

Requirements:

Secure authentication

Password hashing

Role-based authorization

CSRF protection

Input validation

File type validation

File size limits

Secure file URLs

Audit logging

No unauthorized access to trainer documents

Sensitive information must not be publicly accessible

Phone numbers and documents should only be visible to authenticated users with appropriate permissions.

27. UI / UX Design

Create a professional internal enterprise dashboard.

ATOM Brand Style

Use:

White background

ATOM green as primary accent

Dark green sidebar

Clean cards

Modern tables

Rounded corners

Professional typography

Responsive design

Desktop-first but mobile friendly

Use a sidebar:

Dashboard
Trainers
Project Requirements
Skills
Availability
Projects
Documents
Reports
Users
Settings

Top bar:

Global Search
Notifications
User Profile

28. Trainer Directory Layout

Create two viewing modes:

Card View

Useful for quickly browsing trainers.

Table View

Columns:

Name
Primary Skill
Experience
Location
Trainer Type
Availability
Rating
Projects
Actions

Actions:

View
Edit
Call
WhatsApp
Download CV

Allow switching between Card View and Table View.

29. Quick Contact Actions

Every trainer should have quick actions.

Desktop

[📞 Call]

[💬 WhatsApp]

[✉ Email]

Mobile

Use floating contact actions where appropriate.

30. Trainer Tags

Allow tags such as:

Top Rated

Java Expert

Python Expert

Available Immediately

Bangalore

Pan India

Online

Corporate Trainer

College Trainer

Weekend Trainer

Premium Trainer

Admin can create custom tags.

31. Database Models

Create proper relational database models.

Suggested models:

User

id

name

email

password

role

status

created_at

Trainer

id

trainer_code

first_name

last_name

profile_photo

phone

whatsapp_number

email

alternate_phone

address

city

state

country

designation

organization

total_experience

training_experience

industry_experience

trainer_type

employment_type

bio

status

rating

created_at

updated_at

Skill

id

name

category

description

active

TrainerSkill

trainer

skill

proficiency

years_of_experience

Education

trainer

degree

specialization

university

year

Certification

trainer

certification_name

issuing_organization

certificate_id

issue_date

expiry_date

document

TrainingExperience

trainer

client

project_name

technology

duration

student_count

location

mode

year

rating

Project

project_name

client

technology

start_date

end_date

location

mode

status

TrainerProject

trainer

project

role

rating

feedback

TrainerAvailability

trainer

status

start_date

end_date

location

mode

notes

TrainerDocument

trainer

document_name

document_type

file

uploaded_by

uploaded_at

TrainerNote

trainer

note

created_by

created_at

TrainerRating

trainer

project

technical_rating

communication_rating

engagement_rating

punctuality_rating

content_rating

overall_rating

comments

ProjectRequirement

project

required_skills

experience_required

location

mode

required_trainers

start_date

end_date

ActivityLog

user

action

trainer

timestamp

metadata

32. API Requirements

Create REST APIs for:

Authentication

Trainer CRUD

Trainer search

Advanced trainer filtering

Skills

Trainer skills

Education

Certifications

Projects

Trainer projects

Availability

Documents

Ratings

Notes

Project requirements

Trainer matching

Dashboard statistics

Reports

Export

Activity logs

33. Search API

Create a powerful trainer search endpoint.

Example:

GET:

/api/trainers/search/?q=python

It should search across relevant fields.

Support:

Exact search

Partial search

Multiple keywords

Skill aliases

Filters

Sorting

Pagination

Example:

/api/trainers/search/?q=python&location=bangalore&experience_min=5&availability=available

34. Trainer Matching API

Create:

POST /api/project-requirements/{id}/match-trainers/

Return ranked trainers with:

Match percentage

Skill match

Experience match

Location match

Availability match

Mode match

Rating

35. Notifications

Provide notifications for:

Trainer availability ending

Documents expiring

Certification expiring

New project requirement

Trainer assignment

Profile incomplete

Trainer status changes

36. Incomplete Profile Indicator

Calculate profile completeness.

Example:

Profile Completeness: 85%

Missing:

Certification

Profile photo

Previous projects

Display a progress bar.

37. Trainer Profile QR Code

Optionally generate a QR code for each trainer profile.

Scanning the QR should open an authenticated or controlled trainer profile.

38. Reports

Create reports such as:

Trainers by technology

Trainers by location

Trainers by experience

Available trainers

Top-rated trainers

Most-used trainers

Trainer utilization

Project-wise trainer allocation

Trainers with incomplete profiles

Expiring certifications

Expiring documents

39. Important UX Requirement

The application should make this workflow extremely fast.

For example:

Requirement received:

"Need Python trainer for 5 days in Mysore."

Admin should be able to:

Open Trainer Directory

Search Python

Filter Mysore

Filter Available

Filter 5+ years

See matching trainers

Click trainer

View profile

View CV

Click WhatsApp

Contact trainer

The complete process should take less than a few minutes.

40. Seed Data

Create sample trainer data for testing.

Add at least 15 sample trainers covering:

Java

Python

C++

DSA

MERN

MEAN

AI/ML

Data Science

Cloud

DevOps

Aptitude

Soft Skills

Communication

VLSI

Embedded Systems

Use realistic but clearly fictional sample data.

41. Responsive Design

The platform must work on:

Desktop

Laptop

Tablet

Mobile

On mobile:

Trainer cards should stack properly

Call button should open phone dialer

WhatsApp button should open WhatsApp

Profile should remain easy to read

Search should remain prominent

42. Important Product Principle

This is NOT a public trainer marketplace.

It is an:

Internal ATOM Trainer Management & Resource Allocation System.

Therefore prioritize:

Speed

Searchability

Data organization

Privacy

Contactability

Availability

Trainer matching

Project allocation

43. Final Navigation

Sidebar:

Dashboard

Trainer Directory

Add Trainer

Project Requirements

Trainer Matching

Availability

Projects

Skills

Documents

Reports

Users

Settings

44. Final Deliverable

Build a fully functional application, not just a UI prototype.

The application must include:

Frontend

Backend

PostgreSQL database

Authentication

Role-based access

Trainer CRUD

Advanced search

Skill management

Trainer profiles

CV/document management

Availability

Project requirements

Smart trainer matching

Call functionality

WhatsApp functionality

Email functionality

Ratings

Notes

Reports

Excel/CSV import

Excel/CSV/PDF export

Activity logs

Responsive UI

Use clean architecture and modular code.

Create proper database migrations, API documentation, seed data, environment configuration, error handling, validation, and README documentation.

The final application should feel like a professional internal product developed specifically for ATOM.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c05d86ac-a671-443b-938a-21f9e4ce5ba9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
