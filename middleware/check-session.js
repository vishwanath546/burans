exports.check_session = (request, response, next) => {
  console.log(request.cookies.user);
  if (!request.cookies.user) {
    let error = new Error("Session Time out");
    error.statusCode = 200;
    throw error;
  } else {
    request.cust_id = request.cookies.user.authId;
    next();
  }
};
