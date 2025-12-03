import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            firebaseUser?: {
                uid: string;
                email?: string;
                name?: string;
            };
        }
    }
}

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized - No token provided' });
            return;
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decodedToken = await getAuth().verifyIdToken(token);

            req.firebaseUser = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
            };

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ error: 'Unauthorized - Invalid token' });
            return;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
}
