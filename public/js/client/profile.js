$(document).ready(function () {
  app.formValidation();
});

function InsertAddress(form) {
  app
    .request("client/insert_addresss", new FormData(form))
    .then((response) => {
      if (response.status) {
        app.successToast(response.body);
      } else {
        app.errorToast(response.body);
      }
      $("#addressModal").modal("hide");
    })
    .catch((error) => {
      app.errorToast(error.responseJSON.message);
    });
}

function UpdateAddress(form) {
  app
    .request("client/update_address", new FormData(form))
    .then((response) => {
      if (response.status) {
        app.successToast(response.body);
      } else {
        app.errorToast(response.body);
      }
      $("#addressModal").modal("hide");
    })
    .catch((error) => {
      app.errorToast(error.responseJSON.message);
    });
}

function ViewAddress(form) {
  app
    .request("client/view_address", {})
    .then((response) => {
      if (response.status) {
        app.successToast(response.body);
      } else {
        app.errorToast(response.body);
      }
    })
    .catch((error) => {
      app.errorToast(error.responseJSON.message);
    });
}

function DeleteAddress(form) {
  app
    .request("client/delete_address", {})
    .then((response) => {
      if (response.status) {
        app.successToast(response.body);
      } else {
        app.errorToast(response.body);
      }
    })
    .catch((error) => {
      app.errorToast(error.responseJSON.message);
    });
}
