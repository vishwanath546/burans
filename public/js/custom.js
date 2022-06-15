const app = (function () {
  const countries = ["India"];
  const jsonResponse = (string) => {
    return JSON.parse(atob(string));
  };

  const request = (url, formData, type = "POST") => {
    console.log(baseURL, url);
    return new Promise((resolve, reject) => {
      $.ajax({
        type: type,
        url: baseURL + url,
        dataType: "json",
        data: formData,
        processData: false,
        contentType: false,
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        },
      });
    });
  };

  const dataTable = (
    elementID,
    ajax = undefined,
    column = undefined,
    rowRenderCallback = undefined,
    initCompleteCallback = undefined
  ) => {
    if (elementID !== undefined) {
      let object = {
        destroy: true,
        processing: true,
        serverSide: true,
        responsive: true,
        order: [],
        pagingType: "simple_numbers",
      };

      if (ajax !== undefined) {
        var ajaxObject = {};
        if (ajax.hasOwnProperty("data")) ajaxObject.data = ajax.data;
        if (ajax.hasOwnProperty("url")) {
          ajaxObject.url = ajax.url;
          ajaxObject.type = "POST";
        }
        object.ajax = ajaxObject;
      }

      if (rowRenderCallback !== undefined)
        object.fnRowCallback = rowRenderCallback;

      if (initCompleteCallback !== undefined)
        object.initComplete = initCompleteCallback;

      if (column !== undefined) object.columns = column;

      $.fn.DataTable.ext.pager.numbers_length = 4;
      $(`#${elementID}`).DataTable(object);
    }
  };

  const validation = (
    formElement,
    rules,
    message,
    submitHandlerFunction,
    errorPlacement = null
  ) => {
    $(`#${formElement}`).validate({
      rules: rules,
      messages: message,
      errorClass: "text-danger",
      errorElement: "span",
      submitHandler: submitHandlerFunction,
      errorPlacement: errorPlacement,
    });
  };

  const selectOption = (
    element,
    placeholder,
    ajax,
    data,
    templateResult,
    templateSelection
  ) => {
    let options = {
      placeholder: placeholder,
      allowClear: true,
    };

    if (ajax) {
      options.ajax = ajax;
    } else if (data) {
      options.data = data;
    }

    if (templateResult) {
      options.templateResult = templateResult;
    }

    if (templateSelection) {
      options.templateSelection = templateSelection;
    }

    $(`#${element}`).select2(options);
  };

  const successToast = (message, position = "topRight") => {
    iziToast.success({
      position: position,
      message: message,
      transitionIn: "flipInX",
      transitionOut: "flipOutX",
    });
  };

  const errorToast = (message, position = "topRight") => {
    iziToast.error({
      position: position,
      message: message,
      transitionIn: "flipInX",
      transitionOut: "flipOutX",
    });
  };

  const confirmationBox = () => {
    $("[data-confirm]").each(function () {
      let me = $(this),
        me_data = me.data("confirm");

      me_data = me_data.split("|");
      me.fireModal({
        title: me_data[0],
        body: me_data[1],
        buttons: [
          {
            text: me.data("confirm-text-yes") || "Yes",
            class: "btn btn-danger btn-shadow",
            handler: function (modal) {
              $.destroyModal(modal);
              eval(me.data("confirm-yes"));
            },
          },
          {
            text: me.data("confirm-text-cancel") || "Cancel",
            class: "btn btn-secondary",
            handler: function (modal) {
              $.destroyModal(modal);
              eval(me.data("confirm-no"));
            },
          },
        ],
      });
    });
  };

  const imagePreview = (url, title, action = "") => {
    let clickEvent = ``;
    if (action != "") {
      clickEvent = `data-confirm="Realy?|Do you want to delete Image?"
                               data-confirm-yes="${action}" `;
    }
    return `<div class="gallery-item" ${clickEvent}
                     data-image="${url}" data-title="${title}"
                     href="${url}"
                     style="background-image: url('${url}');"
                     title="${title}"></div>`;
  };

  const addValidation = (elementID, rule) => {
    $(`#${elementID}`).rules("add", rule);
  };

  const removeValidation = (elementID, rule) => {
    $(`#${elementID}`).rules("remove", rule);
  };

  const catchHandler = (error) => {
    console.log("Save Room Type Throw Error", error);
    errorToast("Something went wrong");
  };

  const formValidation = () => {
    let forms = document.forms;
    for (let i = 0; i < forms.length; i++) {
      if (forms[i].hasAttribute("data-form-valid")) {
        let formID = forms[i].getAttribute("id");
        let handlerName = forms[i].getAttribute("data-form-valid");

        let elements = forms[i].elements;
        let formRules = {};
        let formMessages = {};
        for (let e = 0; e < elements.length; e++) {
          let elementName = elements[e].getAttribute("name");
          let elementRuleObject = {};
          let elementMessageObject = {};
          if (elements[e].hasAttribute("data-valid")) {
            let rules = elements[e].getAttribute("data-valid");
            let messages = elements[e].getAttribute("data-msg");
            let validationsRules = rules.split("|");
            let validationsMessages = messages.split("|");
            validationsRules.forEach((prop, index) => {
              if (!prop.includes("=")) {
                elementRuleObject[prop] = true;
                if (validationsMessages[index]) {
                  elementMessageObject[prop] = validationsMessages[index];
                } else {
                  elementMessageObject[prop] = $.validator.messages[prop];
                }
              } else {
                let splitProp = prop.split("=");
                elementRuleObject[splitProp[0]] = splitProp[1];
                if (validationsMessages[index]) {
                  elementMessageObject[splitProp[0]] =
                    validationsMessages[index];
                } else {
                  elementMessageObject[splitProp[0]] =
                    $.validator.messages[splitProp[0]];
                }
              }
            });
            formRules[elementName] = elementRuleObject;
            formMessages[elementName] = elementMessageObject;
          }
        }

        let hasFunction = window[handlerName];
        if (typeof hasFunction === "function") {
          validation(
            formID,
            formRules,
            formMessages,
            hasFunction,
            function (error, element) {
              let placement = $(element).data("error");
              if (placement) {
                $(placement).append(error);
              } else {
                error.insertAfter(element);
              }
            }
          );
        }
      }
    }
  };

  const deleteImage = (id) => {
    let formData = new FormData();
    formData.set("id", id);
    return request("deleteImage", formData);
  };

  const getDate = (dateString) => {
    if (dateString !== "") {
      var dateVal = new Date(dateString);
      var day = dateVal.getDate().toString().padStart(2, "0");
      var month = (1 + dateVal.getMonth()).toString().padStart(2, "0");
      var hour = dateVal.getHours().toString().padStart(2, "0");
      var minute = dateVal.getMinutes().toString().padStart(2, "0");
      var sec = dateVal.getSeconds().toString().padStart(2, "0");
      var ms = dateVal.getMilliseconds().toString().padStart(3, "0");
      var inputDate =
        dateVal.getFullYear() +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hour +
        ":" +
        minute +
        ":" +
        sec +
        "." +
        ms;
      return inputDate;
    }
    return dateString;
  };

  return {
    jsonResponse: (string) => jsonResponse(string),
    request: (url, formData, type) => request(url, formData, type),
    dataTable: (
      elementID,
      ajax = undefined,
      column = undefined,
      rowRenderCallback = undefined,
      initCompleteCallback = undefined
    ) =>
      dataTable(
        elementID,
        ajax,
        column,
        rowRenderCallback,
        initCompleteCallback
      ),
    validation: (formElement, rules, message, submitHandlerFunction) =>
      validation(formElement, rules, message, submitHandlerFunction),
    selectOption: (
      element,
      placeholder,
      ajax = null,
      data = null,
      templateResult = null,
      templateSelection = null
    ) =>
      selectOption(
        element,
        placeholder,
        ajax,
        data,
        templateResult,
        templateSelection
      ),
    successToast: (message, position) => successToast(message, position),
    errorToast: (message, position) => errorToast(message, position),
    confirmationBox: () => confirmationBox(),
    formValidation: () => formValidation(),
    catchHandler: (error) => catchHandler(error),
    setValidation: (elementID, rules) => addValidation(elementID, rules),
    removeValidation: (elementID, rule) => removeValidation(elementID, rule),
    getDate: (string) => getDate(string),
    imagePreview: (url, title, id) => imagePreview(url, title, id),
    deleteImage: (id) => deleteImage(id),
  };
})();
