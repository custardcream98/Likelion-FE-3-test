const CLASS_DISABLED = "disabled";
const MAX_TIME = {
  "timer-hour": 99,
  "timer-minute": 59,
  "timer-second": 59,
};

export class Timer {
  constructor() {
    const timer = document.querySelector(".timer");

    this.hours = timer.querySelector("#timer-hour");
    this.minutes = timer.querySelector("#timer-minute");
    this.seconds = timer.querySelector("#timer-second");

    this.btnStart = timer.querySelector("#btn-start");
    this.btnPause = timer.querySelector("#btn-pause");
    this.btnReset = timer.querySelector("#btn-reset");

    this.isTimerActivated = false;
  }

  setup() {
    this.bindEvents();
  }

  bindEvents() {
    const timerEleArr = [this.hours, this.minutes, this.seconds];

    const onTimerInputChange = (event) => {
      const { currentTarget: input } = event;

      while (true) {
        input.value = input.value.slice(-2).padStart(2, "0");

        if (MAX_TIME[input.name] < parseInt(input.value)) {
          input.value = MAX_TIME[input.name].toString();
        } else if (parseInt(input.value) < 0) {
          input.value = "00";
        } else {
          break;
        }
      }

      for (const timerInput of timerEleArr) {
        if (parseInt(timerInput.value) !== 0) {
          this.btnStart.classList.remove(CLASS_DISABLED);
          this.btnReset.classList.remove(CLASS_DISABLED);
          return;
        }
      }

      this.btnStart.classList.add(CLASS_DISABLED);
      this.btnReset.classList.add(CLASS_DISABLED);
    };

    timerEleArr.forEach((ele) => ele.addEventListener("keyup", onTimerInputChange));

    const showElement = (element) => element.removeAttribute("hidden");
    const hideElement = (element) => element.setAttribute("hidden", "hidden");

    const timeout = () => {
      timerEleArr.forEach((ele) => ele.setAttribute("readonly", "readonly"));
      this.currentTimeout = setTimeout(() => {
        const [hoursVal, minutesVal, secondsVal] = timerEleArr.map((ele) => parseInt(ele.value));

        let timeRemain = hoursVal * 3600 + minutesVal * 60 + secondsVal;

        if (timeRemain > 0) {
          timeRemain--;

          const nextHour = Math.floor(timeRemain / 3600);
          timeRemain -= nextHour * 3600;
          this.hours.value = nextHour.toString().padStart(2, "0");

          const nextMinute = Math.floor(timeRemain / 60);
          timeRemain -= nextMinute * 60;
          this.minutes.value = nextMinute.toString().padStart(2, "0");

          this.seconds.value = timeRemain.toString().padStart(2, "0");

          return timeout();
        }

        timerEleArr.forEach((ele) => ele.removeAttribute("readonly"));
        hideElement(this.btnPause);
        showElement(this.btnStart);
      }, 1000);
    };

    this.btnStart.addEventListener("click", () => {
      hideElement(this.btnStart);
      showElement(this.btnPause);
      timeout();
    });

    this.btnPause.addEventListener("click", () => {
      clearTimeout(this.currentTimeout);
      timerEleArr.forEach((ele) => ele.removeAttribute("readonly"));
      hideElement(this.btnPause);
      showElement(this.btnStart);
    });

    this.btnReset.addEventListener("click", (event) => {
      timerEleArr.forEach((ele) => {
        ele.removeAttribute("readonly");
        ele.value = "00";
        onTimerInputChange(event);
      });
      hideElement(this.btnPause);
      showElement(this.btnStart);
    });
  }
}
