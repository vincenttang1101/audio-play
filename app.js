/**
 * 1. Render songs
 * 2. Scroll top/bot
 * 3. Play/ pause / seek
 * 4. CD rotate
 * 5. Next /prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");

const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");
const PLAYER_STORAGE_KEY = "player-config";

const app = {
  currentIndex:
    JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))?.currentIndex || 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isActiveSong: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songsPlayed: [],
  songs: [
    {
      name: "Có Ai Hẹn hò Cùng Em Chưa",
      singer: "Quân A.P",
      path: "./assets/music/CoAiHenHoCungEmChua.mp3",
      image: "./assets/image/CoAiHenHoCungEmChua.jpg",
    },
    {
      name: "Bây Giờ Anh Đang Suy",
      singer: "Darki",
      path: "./assets/music/BayGioAnhDangSuy.mp3",
      image: "./assets/image/BayGioAnhDangSuy.jpg",
    },
    {
      name: "Đố Anh Quên Được Em",
      singer: "LONA, Đỗ Hiếu",
      path: "./assets/music/DoAnhQuenDuocEm.mp3",
      image: "./assets/image/DoAnhQuenDuocEm.jpg",
    },
    {
      name: "Mà Vẫn Cô Đơn",
      singer: "Khải, 14 Casper",
      path: "./assets/music/MaVanCoDon.mp3",
      image: "./assets/image/MaVanCoDon.jpg",
    },
    {
      name: "Vì Em Chưa Bao Giờ Khóc",
      singer: "Hà Nhi, A.C Xuân Tài",
      path: "./assets/music/ViEmChuaBaoGioKhoc.mp3",
      image: "./assets/image/ViEmChuaBaoGioKhoc.jpg",
    },
    {
      name: "Milk N Tea",
      singer: "Híu, Bâu, Trang Hàn",
      path: "./assets/music/MilkNTea.mp3",
      image: "./assets/image/MilkNTea.jpg",
    },
    {
      name: "datfitzx, Dein",
      singer: "Red Hair",
      path: "./assets/music/RedHair.mp3",
      image: "./assets/image/RedHair.jpg",
    },
  ],
  // 1. Render songs
  render: function () {
    const htmls = this.songs.map(
      (song, index) =>
        `
      <div class="song${
        index === this.config.currentIndex ? " active" : ""
      }" data-index="${index}">
        <div
          class="thumb"
          style="
            background-image: url('${song.image}');
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
      `
    );
    $(".playlist").innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;

    this.setConfig("currentIndex", this.currentIndex);
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // 4. CD rotate
    // Xử lý CD xoay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // 2. Scroll top/bot
    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // 3. Play/ pause / seek
    // Xử lý khi click play
    playBtn.onclick = function () {
      _this.isPlaying ? audio.pause() : audio.play();

      // Khi bài hát được play
      audio.onplay = function () {
        _this.isPlaying = true;
        player.classList.add("playing");
        cdThumbAnimate.play();
      };

      // Khi bài hát bị pause
      audio.onpause = function () {
        _this.isPlaying = false;
        player.classList.remove("playing");
        cdThumbAnimate.pause();
      };

      // Phát hiện tiến độ bài hát thay đổi
      audio.ontimeupdate = function () {
        const progressPercent = !isNaN(audio.duration)
          ? Math.floor((audio.currentTime * 100) / audio.duration)
          : 0;

        progress.value = progressPercent;
      };
    };

    // Khi tua bài hát
    progress.oninput = function (e) {
      const currentPercent = e.target.value;
      const seekTime = (audio.duration * currentPercent) / 100;
      audio.currentTime = seekTime;
    };

    // 5. Next / prev
    // Khi nhấn next song
    nextBtn.onclick = function () {
      _this.isRandom ? _this.randomSong() : _this.nextSong();
      _this.isPlaying ? audio.play() : audio.pause();
    };

    // Khi nhấn prev song
    prevBtn.onclick = function () {
      _this.isRandom ? _this.randomSong() : _this.prevSong();
      _this.isPlaying ? audio.play() : audio.pause();
      z;
    };

    // 6. Random + 7. Next / Repeat when ended
    // Xử lý bật/tắt random bài hát
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý bật/tắt repeat một bài hát
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next / repeat bài nhạc khi kết thúc
    audio.onended = function () {
      _this.isRepeat ? audio.play() : nextBtn.click();
    };

    // Lắng nghe hành vi click vào playlist
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      // Xử lý khi click vào bài nhạc
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          // Huỷ sự kiện active của bài hát cũ
          _this.activeSong(_this.currentIndex, false);

          // Kích hoạt sự kiện active của bài hát mới
          _this.currentIndex = Number(songNode.dataset.index);
          _this.activeSong(_this.currentIndex, true);
          _this.loadCurrentSong();
          audio.play();
        }
      }

      // Xử lý khi click vào nhạc option
      if (e.target.closest(".option")) {
      }
    };
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  // 8. Active song
  // Gọi this.render() để active lại
  nextSong: function () {
    this.activeSong(this.currentIndex, false);
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;

    this.activeSong(this.currentIndex, true);
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.activeSong(this.currentIndex, false);
    this.currentIndex =
      (this.currentIndex - 1 + this.songs.length) % this.songs.length;

    this.activeSong(this.currentIndex, true);
    this.loadCurrentSong();
  },
  randomSong: function () {
    let newIndex;
    !this.songsPlayed.includes(this.currentIndex)
      ? this.songsPlayed.push(this.currentIndex)
      : null;

    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.songsPlayed.includes(newIndex));

    this.songsPlayed.push(newIndex);

    /* Reset lại danh sách nhạc nếu đã random đủ
    console.log(this.songsPlayed); */
    if (this.songs.length === this.songsPlayed.length) {
      this.songsPlayed = [];
    }

    this.activeSong(this.currentIndex, false);
    this.activeSong(newIndex, true);

    this.currentIndex = newIndex;

    this.loadCurrentSong();
  },
  activeSong: function (index, isActiveSong) {
    const songs = $$(".song");
    this.isActiveSong = isActiveSong;
    songs[index].classList.toggle("active", this.isActiveSong);
  },
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho Object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM Events)
    this.handleEvents();

    // Tải thông tin bài hát đàu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
