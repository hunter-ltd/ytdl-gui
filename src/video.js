const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ytdl = require("ytdl-core");

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Video object
 * @param {string} url YouTube URL of the video
 * @param {string} title Title of the video
 */
class Video {
  constructor(url, title) {
    this.url = url;
    this.title = title;
  }

  /**
   * Downloads and saves the Video as an MP3 file
   * @param {string} save_path File path the file will be saved to
   * @returns {Promise} A promise resolving with save_path and rejecting with an error
   */
  async save(save_path) {
    return new Promise(async (resolve, reject) => {
      let stream = ytdl(this.url, { filter: "audioonly" }),
        output = ffmpeg(stream).save(save_path);

      [stream, output].forEach((item) =>
        item.on("error", (err) => reject(err))
      );
      output
        .on(
          "start",
          () => (document.getElementById("status").innerHTML = "Downloading...")
        )
        .on("end", () => resolve(save_path));
    });
  }
}

module.exports = Video;
