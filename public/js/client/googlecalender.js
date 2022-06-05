$(document).ready(function () {
  let params = new URL(document.location).searchParams;
  let code = params.get("code");
  console.log("code", code);
  if (code != null) {
    get_events((eventlist) => {
      var calendar = $("#calendar").fullCalendar({
        editable: true,
        header: {
          left: "prev,next today",
          center: "title",
          right: "month,agendaWeek,agendaDay",
        },

        events: eventlist,
        selectable: true,
        selectHelper: true,
        select: function (start, end, allDay) {
          var title = prompt("Enter Event Title");
          if (title) {
            var start = $.fullCalendar.formatDate(start, "Y-MM-DD HH:mm:ss");
            var end = $.fullCalendar.formatDate(end, "Y-MM-DD HH:mm:ss");
            $.ajax({
              url: "insert.php",
              type: "POST",
              data: { title: title, start: start, end: end },
              success: function () {
                calendar.fullCalendar("refetchEvents");
                alert("Added Successfully");
              },
            });
          }
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
          console.log(event);
          $("#eventlist").empty();
          let eventlis = `<li class="list-group-item">Event From :- ${event.email_from}</li>
          <li class="list-group-item">Cretaed :- ${event.created} </li>
          <li class="list-group-item">summary:- ${event.title} </li>
          <li class="list-group-item"> <a href="${event.htmlLink}" target="_blank">Click To View</a></li>`;
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
});

function get_events(cb) {
  let params = new URL(document.location).searchParams;
  let code = params.get("code");
  let data = new FormData();
  data.set("code", code);
  app
    .request("client/get_events", data, "POST")
    .then((response) => {
      cb(response);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
}
