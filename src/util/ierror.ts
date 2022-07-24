export class IError extends Error {
    statusCode?: number;
    data?: any;
}