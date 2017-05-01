# Course Discourse
This is a website designed to connect students investigating their next semester's course load with peers who have already taken these courses. 

## Installation
Two additional components are required to host this website: Node.JS and MongoDB. 

### Setting up Mongo

1. Create database called 'course-discourse'
2. Initialize the 'courses' collection with course information and the 'datas' collection available majors, minors, clubs, and interests. 
    + Each course document contains a 'year', 'season', 'courseName', 'courseNumber', 'departmentName', and 'departmentCode' fields
        + Macalester's course information is provided in "courses.json"
    + Each data collection contains a 'name', and a 'values' fields
        + The name field is the data listed (eg majors)
        + The values field is a list of data elements
        + Macalester's course information is provided in "data.json"

### Setting up Node

1. Run &nbsp;&nbsp; `npm install` &nbsp;&nbsp; to download packages. 
2. Run &nbsp;&nbsp; `node app/app.js` &nbsp;&nbsp; to start the server. 