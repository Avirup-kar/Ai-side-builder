import express from 'express';
import { creatUserProject, getAllUserProjects, getUserCredits, getUserProject, purchaseCredits, toggleProjectPublish } from '../controllers/userControllers.js';
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.get('/credits', protect, getUserCredits);
userRouter.post('/project', protect, creatUserProject);
userRouter.get('/project/:projectId', protect, getUserProject);
userRouter.get('/projects', protect, getAllUserProjects);
userRouter.get('/publish-toggle/:projectId', protect, toggleProjectPublish);
userRouter.post('/purchase-credits', protect, purchaseCredits);

export default userRouter;