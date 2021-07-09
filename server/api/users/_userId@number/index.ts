import type { UserInfo, UserUpdateBody, UserWithoutPersonal } from '$/types'

export type Methods = {
  /**
   * get a user
   * GET /users/_userId@number
   */
  get: {
    resBody: UserInfo
  }

  /**
   * update a user
   * [jn] PUT /users/_userId@number
   */
  put: {
    reqFormat: FormData // required
    reqBody: UserUpdateBody
    resBody: UserWithoutPersonal
  }

  /**
   * delete a user
   * [jn] DELETE /users/_userId@number
   */
  delete: {
    status: 204
  }
}
