$(document).ready(function () {
  get_events();
});

function get_events() {
  let params = new URL(document.location).searchParams;
  let code = params.get("code");
  let data = new FormData();
  data.set("code", code);
  if (code != null) {
    app.request("client/get_events", data, "POST").then((eventlist) => {
      var calendar = $("#calendar").fullCalendar({
        editable: true,
        weekends: true,
        weekNumbers: false,
        header: {
          left: "prev,next today",
          center: "title",
          right: "month,agendaWeek,agendaDay",
        },
        theme: false,
        events: eventlist,
        selectable: true,
        selectHelper: true,
        select: async function (start, end, allDay) {
          console.log(moment(start).format("YYYY-MM-DDTh:mm"));
          $("#startdate").empty();
          $("#startdate").val(
            moment(start).format("YYYY-MM-DD") + "T" + moment().format("h:mm")
          );
          $("#enddate").empty();
          $("#enddate").val(
            moment(end).subtract(1, "days").format("YYYY-MM-DD") +
              "T" +
              moment().format("h:mm")
          );
          $("#event_create_modal").modal("toggle");
          // var title = prompt("Enter Event Title");
          // if (title) {
          //   var start = $.fullCalendar.formatDate(start, "Y-MM-DD HH:mm:ss");
          //   var end = $.fullCalendar.formatDate(end, "Y-MM-DD HH:mm:ss");
          //   await insert_events(title, start, end);
          // }
        },
        editable: true,
        eventResize: function (event) {
          var start = $.fullCalendar.formatDate(
            event.start,
            "Y-MM-DD HH:mm:ss"
          );
          var end = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
          var title = event.title;
          var id = event.id;
          $.ajax({
            url: "update.php",
            type: "POST",
            data: { title: title, start: start, end: end, id: id },
            success: function () {
              calendar.fullCalendar("refetchEvents");
              alert("Event Update");
            },
          });
        },

        eventDrop: function (event) {
          var start = $.fullCalendar.formatDate(
            event.start,
            "Y-MM-DD HH:mm:ss"
          );
          var end = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
          var title = event.title;
          var id = event.id;
          $.ajax({
            url: "update.php",
            type: "POST",
            data: { title: title, start: start, end: end, id: id },
            success: function () {
              calendar.fullCalendar("refetchEvents");
              alert("Event Updated");
            },
          });
        },

        eventClick: function (event) {
          console.log("sdaffa", event);
          $("#eventlist").empty();
          let eventlis = ` <li class="list-group-item">Title:- ${event.title} </li>`;
          if (event.description != "") {
            eventlis += `<li class="list-group-item">Description:- ${event.description} </li>`;
          }
          eventlis += `<li class="list-group-item">Event From :- ${event.email_from}</li>`;
          if (
            event.start != null &&
            event.end != null &&
            "_i" in event.start &&
            "_i" in event.end
          ) {
            eventlis += `<li class="list-group-item">Time  :- ${moment(
              event.start._i
            ).format("YYYY-MM-DD h:mm a")} TO ${moment(event.end._i).format(
              "YYYY-MM-DD h:mm a"
            )}</li>`;
          }

          eventlis += `<li class="list-group-item"> <a href="${event.htmlLink}" target="_blank">Click To View</a></li>`;
          if (event.hangoutLink != "") {
            eventlis += `<li class="list-group-item"> <a href="${event.hangoutLink}" target="_blank">Click To join Meet</a></li>`;
          }

          $("#eventlist").append(eventlis);
          $("#event_view_modal").modal("toggle");
          // if (confirm("Are you sure you want to remove it?")) {
          //   var id = event.id;
          //   $.ajax({
          //     url: "delete.php",
          //     type: "POST",
          //     data: { id: id },
          //     success: function () {
          //       calendar.fullCalendar("refetchEvents");
          //       alert("Event Removed");
          //     },
          //   });
          // }
        },
      });
    });
  }
}

function insert_events(title, start, end) {
  console.log($("#startdate").val());
  let params = new URL(document.location).searchParams;
  let code = params.get("code");
  let data = new FormData();
  data.set("code", code);
  data.set("title", $("#title").val());
  data.set("startdate", moment($("#startdate").val()).format());
  data.set("enddate", moment($("#enddate").val()).format());
  data.set("starttime", $("#starttime").val());
  data.set("endtime", $("#endtime").val());
  data.set("description", $("#description").val());
  data.set("people", $("#people").val());
  if (code != null) {
    // app.request("client/insert_events", data, "POST").then((result) => {
    //   console.log(result);
    //   if (result.status) {
    //     $("#event_create_modal").modal("toggle");
    //     alert(result.msg);
    //     get_events();
    //   }
    // });
  }
}
