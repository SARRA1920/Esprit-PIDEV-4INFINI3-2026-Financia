# Frontend Manifest

Module: User Management
- endpoint: `/user/register`
  method: `POST`
  dto fields: `username, email, firstName, lastName, passwordHash, role, isActive`
  auth: `no`
- endpoint: `/user/{userId}`
  method: `GET`
  dto fields: `userId`
  auth: `no`
- endpoint: `/user/username/{username}`
  method: `GET`
  dto fields: `username`
  auth: `no`
- endpoint: `/user/update`
  method: `PUT`
  dto fields: `userId, username, email, firstName, lastName, role`
  auth: `no`
- endpoint: `/user/{userId}`
  method: `DELETE`
  dto fields: `userId`
  auth: `no`
- endpoint: `/user/{userId}/deactivate`
  method: `POST`
  dto fields: `userId`
  auth: `no`
- endpoint: `/user/{userId}/activate`
  method: `POST`
  dto fields: `userId`
  auth: `no`

Module: Course Enrollment
- endpoint: `/user/{userId}/enroll/{courseId}`
  method: `POST`
  dto fields: `userId, courseId`
  auth: `no`
- endpoint: `/user/{userId}/unenroll/{courseId}`
  method: `POST`
  dto fields: `userId, courseId`
  auth: `no`
- endpoint: `/user/{userId}/enrolled/{courseId}`
  method: `GET`
  dto fields: `userId, courseId`
  auth: `no`
- endpoint: `/user/{userId}/courses`
  method: `GET`
  dto fields: `userId`
  auth: `no`
- endpoint: `/user/course/{courseId}/users`
  method: `GET`
  dto fields: `courseId`
  auth: `no`

Module: Course Management
- endpoint: `/course/add`
  method: `POST`
  dto fields: `title, description, lessons`
  auth: `no`
- endpoint: `/course/{courseId}`
  method: `GET`
  dto fields: `courseId`
  auth: `no`
- endpoint: `/course`
  method: `GET`
  dto fields: `none`
  auth: `no`
- endpoint: `/course/update`
  method: `PUT`
  dto fields: `courseId, title, description`
  auth: `no`
- endpoint: `/course/{courseId}`
  method: `DELETE`
  dto fields: `courseId`
  auth: `no`
- endpoint: `/course/batch`
  method: `POST`
  dto fields: `title, description[]`
  auth: `no`

Module: Lesson Management
- endpoint: `/lesson/addLesson/{courseId}`
  method: `POST`
  dto fields: `courseId, title, type, orderIndex`
  auth: `no`
- endpoint: `/lesson/getLesson/{lessonId}`
  method: `GET`
  dto fields: `lessonId`
  auth: `no`
- endpoint: `/lesson/getAllLessons`
  method: `GET`
  dto fields: `none`
  auth: `no`
- endpoint: `/lesson/updateLesson`
  method: `POST`
  dto fields: `idLesson, title, type, orderIndex`
  auth: `no`
- endpoint: `/lesson/deleteLesson/{lessonId}`
  method: `DELETE`
  dto fields: `lessonId`
  auth: `no`
- endpoint: `/lesson/addAllLessons/{courseId}`
  method: `POST`
  dto fields: `courseId, title, type, orderIndex[]`
  auth: `no`

Module: Lesson Content
- endpoint: `/lesson-content/text/{lessonId}`
  method: `POST`
  dto fields: `lessonId, text`
  auth: `no`
- endpoint: `/lesson-content/{contentId}`
  method: `GET`
  dto fields: `contentId`
  auth: `no`
- endpoint: `/lesson-content/file/{lessonId}`
  method: `POST`
  dto fields: `lessonId, file`
  auth: `no`
- endpoint: `/lesson-content/quiz/{lessonId}`
  method: `POST`
  dto fields: `lessonId, questions[{id, question, options, correctAnswer}]`
  auth: `no`
- endpoint: `/lesson-content/text/update/{contentId}`
  method: `PUT`
  dto fields: `contentId, text`
  auth: `no`
- endpoint: `/lesson-content/file/update/{contentId}`
  method: `PUT`
  dto fields: `contentId, file`
  auth: `no`
- endpoint: `/lesson-content/quiz/update/{contentId}`
  method: `PUT`
  dto fields: `contentId, questions[{id, question, options, correctAnswer}]`
  auth: `no`
- endpoint: `/lesson-content/delete/{contentId}`
  method: `DELETE`
  dto fields: `contentId`
  auth: `no`

Module: File Serving
- endpoint: `/file/course/{courseId}/{contentId}/file/{filename}`
  method: `GET`
  dto fields: `courseId, contentId, filename`
  auth: `no`

Module: AI Translation
- endpoint: `/ai/translate/{contentId}`
  method: `POST`
  dto fields: `contentId, target`
  auth: `no`
- endpoint: `/ai/translate/content/{contentId}`
  method: `GET`
  dto fields: `contentId`
  auth: `no`
- endpoint: `/ai/translate/detect`
  method: `POST`
  dto fields: `text`
  auth: `no`

Module: AI Quiz Generation
- endpoint: `/ai/generate-quiz/{lessonId}`
  method: `POST`
  dto fields: `lessonId`
  auth: `no`

Module: Recommendations
- endpoint: `/recommendation/getRecommendations/{courseId}`
  method: `GET`
  dto fields: `courseId, limit`
  auth: `no`
- endpoint: `/recommendation/getRecommendationsByGoal/{userId}`
  method: `GET`
  dto fields: `userId, limit`
  auth: `no`
- endpoint: `/user/register`
  method: `POST`
  dto fields: `username, email, firstName, lastName, passwordHash, role, isActive, projectGoal`
  auth: `no`
