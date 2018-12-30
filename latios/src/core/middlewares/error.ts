import { Request, Response, NextFunction } from 'express'

export const errorHanlder = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send({
        error: true,
        message: 'Internal broken!'
    })
  }