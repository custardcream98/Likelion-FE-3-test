const CLASS_DISABLED = "disabled";
const MAX_TIME = {
  "timer-hour": 99,
  "timer-minute": 59,
  "timer-second": 59,
};

const HOUR_IN_SEC = 3600;
const MINUTE_IN_SEC = 60;

const DELTA_TO_SECOND_MAP = {
  "timer-hour": HOUR_IN_SEC,
  "timer-minute": MINUTE_IN_SEC,
  "timer-second": 1,
};

/**
 * 요소를 보이게 만듭니다.
 * @param {HTMLElement} element
 */
const showElement = (element) => element.removeAttribute("hidden");
/**
 * 요소를 숨깁니다.
 * @param {HTMLElement} element
 */
const hideElement = (element) => element.setAttribute("hidden", "hidden");

export class Timer {
  constructor() {
    const timer = document.querySelector(".timer");

    this.hours = timer.querySelector("#timer-hour");
    this.minutes = timer.querySelector("#timer-minute");
    this.seconds = timer.querySelector("#timer-second");

    this.timerEleArr = [this.hours, this.minutes, this.seconds];

    this.btnStart = timer.querySelector("#btn-start");
    this.btnPause = timer.querySelector("#btn-pause");
    this.btnReset = timer.querySelector("#btn-reset");

    /**
     * setTimeout id 담는 변수
     *
     * clearTimeout()에 사용합니다.
     * */
    this.currentTimeout = null;

    /**
     * timeout() 메서드에서 사용하는 객체
     *
     * 이 객체를 통해 `name` 값으로 요소에 접근할 수 있습니다.
     */
    this.TIMER_ELE_MAP = {
      [this.hours.name]: this.hours,
      [this.minutes.name]: this.minutes,
      [this.seconds.name]: this.seconds,
    };
  }

  setup = () => {
    this.bindEvents();
  };

  bindEvents = () => {
    this.timerEleArr.forEach((ele) => {
      ele.addEventListener("keyup", this.changeBtnAbled);
      ele.addEventListener("focus", () => {
        if (!this.currentTimeout) ele.value = "";
      });
      ele.addEventListener("focusout", () => {
        ele.value = this.getSecureInputValue(ele.name, ele.value);
      });
    });

    this.btnStart.addEventListener("click", () => {
      this.changeBtnVisibility("runTimer");
      this.timeout();
    });

    this.btnPause.addEventListener("click", () => {
      clearTimeout(this.currentTimeout);
      this.timerEleArr.forEach((ele) => ele.removeAttribute("readonly"));
      this.changeBtnVisibility("stopTimer");
    });

    this.btnReset.addEventListener("click", () => {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
      this.timerEleArr.forEach((ele) => {
        ele.removeAttribute("readonly");
        ele.value = "00";
      });
      this.changeBtnAbled();
      this.changeBtnVisibility("stopTimer");
    });
  };

  /**
   * input 요소의 name값과 value를 받아
   * 유효한 값으로 바꿔 리턴하는 함수
   * @param {keyof MAX_TIME} name
   * @param {string} value
   * @returns {string}
   */
  getSecureInputValue = (name, value) => {
    if (MAX_TIME[name] < parseInt(value)) {
      return MAX_TIME[name].toString();
    } else if (parseInt(value) < 0 || value === "") {
      return "00";
    }
    return value.slice(-2).padStart(2, "0");
  };

  /**
   * phase 따라 버튼의 visibility 변경
   * @param {"stopTimer" | "runTimer"} phase
   */
  changeBtnVisibility = (phase) => {
    switch (phase) {
      case "runTimer":
        hideElement(this.btnStart);
        showElement(this.btnPause);
        break;
      case "stopTimer":
        hideElement(this.btnPause);
        showElement(this.btnStart);
        break;
      default:
        throw Error('phase는 "runTimer", "stopTimer"만 가능합니다.');
    }
  };

  /**
   * 현재 input값을 검사해서
   * 버튼이 활성화/비활성화 하는 함수
   */
  changeBtnAbled = () => {
    for (const timerInput of this.timerEleArr) {
      if (timerInput.value && parseInt(timerInput.value) !== 0) {
        this.btnStart.classList.remove(CLASS_DISABLED);
        this.btnReset.classList.remove(CLASS_DISABLED);
        return;
      }
    }

    this.btnStart.classList.add(CLASS_DISABLED);
    this.btnReset.classList.add(CLASS_DISABLED);
  };

  /**
   * 타이머 실행 함수, setTimeout()을 이용하며 남은 시간이 있을 경우 재귀적으로 호출합니다.
   */
  timeout = () => {
    // input 요소 readonly attribute 부여
    this.timerEleArr.forEach((ele) => ele.setAttribute("readonly", "readonly"));

    this.currentTimeout = setTimeout(() => {
      let timeRemaining = this.timerEleArr
        .map((ele) => DELTA_TO_SECOND_MAP[ele.name] * parseInt(ele.value) || 0)
        .reduce((acc, e) => acc + e, 0);

      if (timeRemaining > 0) {
        timeRemaining--;

        this.timerEleArr.forEach((ele) => {
          const nextTimeVal = Math.floor(timeRemaining / DELTA_TO_SECOND_MAP[ele.name]);
          timeRemaining -= nextTimeVal * DELTA_TO_SECOND_MAP[ele.name];
          this.TIMER_ELE_MAP[ele.name].value = nextTimeVal.toString().padStart(2, "0");
        });

        return this.timeout();
      }

      alert("⏰ 타이머로 맞춘 시간이 모두 지나갔습니다.");

      this.currentTimeout = null;
      this.timerEleArr.forEach((ele) => ele.removeAttribute("readonly"));
      this.changeBtnVisibility("stopTimer");
      this.changeBtnAbled();
    }, 1000);
  };
}
