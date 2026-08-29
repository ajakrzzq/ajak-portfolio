(function () {
  'use strict';

  /**
   * Footer year
   */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /**
   * The Sign — live open/closed status computed from the clinic's real
   * published hours, in the clinic's own timezone regardless of the
   * visitor's local timezone.
   */
  var SCHEDULE = {
    0: { open: 9 * 60, close: 17 * 60 },  // Sunday
    1: { open: 8 * 60, close: 22 * 60 },  // Monday
    2: { open: 8 * 60, close: 22 * 60 },
    3: { open: 8 * 60, close: 22 * 60 },
    4: { open: 8 * 60, close: 22 * 60 },
    5: { open: 8 * 60, close: 22 * 60 },
    6: { open: 8 * 60, close: 22 * 60 }   // Saturday
  };

  var WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function getClinicTimeParts() {
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kuala_Lumpur',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    var map = {};
    fmt.formatToParts(new Date()).forEach(function (part) {
      map[part.type] = part.value;
    });
    var hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0; // some engines report midnight as "24"
    return {
      day: WEEKDAY_INDEX[map.weekday],
      minutesNow: hour * 60 + parseInt(map.minute, 10)
    };
  }

  function formatTime(totalMinutes) {
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }

  function computeStatus() {
    var now = getClinicTimeParts();
    var today = SCHEDULE[now.day];
    var isOpen = now.minutesNow >= today.open && now.minutesNow < today.close;

    var hoursLabel;
    if (isOpen) {
      hoursLabel = 'Today ' + formatTime(today.open) + '–' + formatTime(today.close);
    } else if (now.minutesNow < today.open) {
      hoursLabel = 'Opens today at ' + formatTime(today.open);
    } else {
      var nextDay = (now.day + 1) % 7;
      hoursLabel = 'Opens tomorrow at ' + formatTime(SCHEDULE[nextDay].open);
    }

    return { isOpen: isOpen, hoursLabel: hoursLabel };
  }

  function renderStatus() {
    var status = computeStatus();
    var signs = document.querySelectorAll('[data-sign]');

    signs.forEach(function (sign) {
      sign.setAttribute('data-state', status.isOpen ? 'open' : 'closed');

      var statusEl = sign.querySelector('[data-sign-status]');
      if (statusEl) statusEl.textContent = status.isOpen ? 'Open Now' : 'Closed Now';

      var hoursEl = sign.querySelector('[data-sign-hours]');
      if (hoursEl) hoursEl.textContent = status.hoursLabel;
    });
  }

  renderStatus();
  window.setInterval(renderStatus, 60000);
})();
