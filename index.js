const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const PixlRequest = require('pixl-request');

const data = require('./mock.json');

const Image = Canvas.Image;
const Font = Canvas.Font;

const canvasSpecs = {
  width: 1200,
  height: 630,
};

const backgroundSpecs = {
  xCoordinate: 0,
  yCoordinate: 0,
  width: 1200,
  height: 630,
};

const logoSpecs = {
  xCoordinate: 30,
  yCoordinate: 560,
  width: 250,
  height: 50,
};

const rectangleSpecs = {
  xCoordinate: 707,
  yCoordinate: 118,
  width: 425,
  height: 425,
};

const thumbnailSpecs = {
  xCoordinate: 853,
  yCoordinate: 263,
  width: 130,
  height: 130,
};

const qrSpecs = {
  xCoordinate: 710,
  yCoordinate: 120,
  width: 420,
  height: 420,
};

const circleSpecs = {
  xCoordinate: 920,
  yCoordinate: 330,
  radius: 68,
  startAngle: 0,
  endAngle: Math.PI * 2,
  antiClockwise: true,
};

const nameSpecs = {
  width: 73,
  height: 250,
};

const descriptionSpecs = {
  width: 75,
  height: 310,
};

const creatorSpecs = {
  width: 75,
  height: 420,
};

if (
  !data ||
  !data.creator ||
  !data.description ||
  !data.name ||
  !data.share_url ||
  !data.thumbnail
) {
  throw new Error('Valid JSON must be provided');
}

function fontFile(name) {
  return path.join(__dirname, 'Archive', name);
}

Canvas.registerFont(fontFile('SF-UI-Display-Regular.otf'), { family: 'SF Display' });
Canvas.registerFont(fontFile('SF-UI-Display-Bold.otf'), { family: 'SF Display', weight: 'bold' });

const canvas = Canvas.createCanvas(canvasSpecs.width, canvasSpecs.height);
const ctx = canvas.getContext('2d');

const background = new Image();
background.src = fs.readFileSync(path.join(__dirname, 'Archive', 'background.jpg'));
ctx.drawImage(
  background,
  backgroundSpecs.xCoordinate,
  backgroundSpecs.yCoordinate,
  backgroundSpecs.width,
  backgroundSpecs.height
);

const logo = new Image();
logo.src = fs.readFileSync(path.join(__dirname, 'Archive', 'logo.png'));
ctx.drawImage(
  logo,
  logoSpecs.xCoordinate,
  logoSpecs.yCoordinate,
  logoSpecs.width,
  logoSpecs.height
);

ctx.rect(
  rectangleSpecs.xCoordinate,
  rectangleSpecs.yCoordinate,
  rectangleSpecs.width,
  rectangleSpecs.height
);
ctx.fillStyle = '#fafafa';
ctx.strokeStyle = '#fafafa';
ctx.shadowBlur = 40;
ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
ctx.fill();
ctx.stroke();

const request = new PixlRequest();
const qrUrl =
  'https://api.qrserver.com/v1/create-qr-code/?size=410x410&ecc=H&margin=15&data=' + data.share_url;
const thumbnail = data.thumbnail;

function fetchThumbnailAndCreateImage(err, resp, data) {
  if (err) throw err;
  var thumbnailImg = new Image();
  thumbnailImg.src = data;
  ctx.drawImage(
    thumbnailImg,
    thumbnailSpecs.xCoordinate,
    thumbnailSpecs.yCoordinate,
    thumbnailSpecs.width,
    thumbnailSpecs.height
  );
  canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image.jpeg')));
}

function fetchQrAndDrawCircle(err, resp, data) {
  if (err) throw err;
  var qrImg = new Image();
  qrImg.src = data;
  ctx.drawImage(
    qrImg,
    qrSpecs.xCoordinate,
    qrSpecs.yCoordinate,
    qrSpecs.width,
    qrSpecs.height
  );
  ctx.beginPath();
  ctx.arc(
    circleSpecs.xCoordinate,
    circleSpecs.yCoordinate,
    circleSpecs.radius,
    circleSpecs.startAngle,
    circleSpecs.endAngle,
    circleSpecs.antiClockwise
  );
  ctx.fillStyle = '#fafafa';
  ctx.strokeStyle = '#000000';
  ctx.closePath();
  ctx.fill();
  request.get(thumbnail, fetchThumbnailAndCreateImage);
}

request.get(qrUrl, fetchQrAndDrawCircle);

ctx.font = 'bold 70px SF Display';
ctx.fillStyle = '#292929';
ctx.fillText(
  data.name,
  nameSpecs.width,
  nameSpecs.height
);

ctx.font = 'normal 27px SF Display';
ctx.fillStyle = '#292929';
ctx.fillText(checkDescription(
  data.description, 48),
  descriptionSpecs.width,
  descriptionSpecs.height
);

ctx.font = 'normal 27px SF Display';
ctx.fillStyle = '#9575CD';
ctx.fillText(
  'Created by @' + data.creator,
  creatorSpecs.width,
  creatorSpecs.height
);

function checkDescription(text, maxChars) {
  if (text.length > 136) {
    throw new Error('Descroption is too long');
  };

  var ret = [];
  var words = text.split(/\b/);
  var currentLine = '';
  var lastWhite = '';
  words.forEach(function (d) {
      var prev = currentLine;
      currentLine += lastWhite + d;

      var l = currentLine.length;

      if (l > maxChars) {
        ret.push(prev.trim());
        currentLine = d;
        lastWhite = '';
      } else {
        var m = currentLine.match(/(.*)(\s+)$/);
        lastWhite = (m && m.length === 3 && m[2]) || '';
        currentLine = (m && m.length === 3 && m[1]) || currentLine;
      }
    });

  if (currentLine) {
    ret.push(currentLine.trim());
  }

  return ret.join('\n');
}
