import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/asyncWrapper';
import { AiService } from './ai.service';

const aiService = new AiService();

export const chat = catchAsync(async (req: Request, res: Response) => {
  const { message, session_id } = req.body;
  const token =
    (req.headers.token as string | undefined) ||
    (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : undefined);

  const result = await aiService.sendMessage(message, session_id, token);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const rawId = req.params.sessionId;
  const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;
  const history = await aiService.getHistory(sessionId);
  res.status(200).json({
    success: true,
    history,
  });
});

export const getHealth = catchAsync(async (_req: Request, res: Response) => {
  const health = await aiService.getHealth();
  res.status(200).json({
    success: true,
    health,
  });
});

export const getDoctors = catchAsync(async (req: Request, res: Response) => {
  const speciality = req.query.speciality as string | undefined;
  const doctors = await aiService.getDoctors(speciality);
  res.status(200).json({
    success: true,
    doctors,
  });
});
