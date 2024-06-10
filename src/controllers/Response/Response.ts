/**
 * @swagger
 * definitions:
 *      Response:
 *          type: object
 *          properties:
 *              Code:
 *                  type: number
 *              Errors:
 *                  type: array
 *                  items:
 *                      $ref: "#/definitions/Error"
 *              PayLoad:
 *                  type: object | null
 *
 *      Error:
 *          type: object
 *          properties:
 *              Code:
 *                  type: number
 *              Message:
 *                  type: string
 */

export class Error
{
    Code: number;
    Message: string | object;

    constructor(code: number, message: string)
    {
        this.Code = code;
        this.Message = message;
    }
}

export class Response
{
    Code: number;
    Errors: Array<Error> | null;
    PayLoad: object | null;

    constructor()
    {
        this.Code = -1;
        this.Errors = new Array<Error>();
        this.PayLoad = null;
    }
}
