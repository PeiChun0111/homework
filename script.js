const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const feedback = document.getElementById('feedback');
const startButton = document.getElementById('startButton');
let detector = null;
let stream = null;

startButton.disabled = true;

async function initDetector() {
  feedback.textContent = '正在載入姿勢偵測模型...';
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'full',
    enableSmoothing: true,
  };

  try {
    detector = await poseDetection.createDetector(model, detectorConfig);
    feedback.textContent = '模型載入完成，請點選「啟動攝影機」。';
    startButton.disabled = false;
  } catch (error) {
    console.error(error);
    feedback.textContent = '模型載入失敗，請檢查網路或重新整理頁面。';
    startButton.disabled = true;
  }
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    feedback.textContent = '您的瀏覽器不支援相機功能。請使用新版 Chrome 或 Edge。';
    return;
  }

  if (!detector) {
    feedback.textContent = '姿勢偵測模型尚未準備好，請稍候再試。';
    return;
  }

  startButton.disabled = true;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 800 },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    runPoseLoop();
  } catch (error) {
    console.error(error);
    feedback.textContent = '無法啟動相機，請確認已允許相機權限。';
    startButton.disabled = false;
  }
}

function drawKeypoints(keypoints) {
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  ctx.strokeStyle = '#7dd3fc';
  ctx.fillStyle = '#38bdf8';
  ctx.lineWidth = 2;

  keypoints.forEach((point) => {
    if (point.score > 0.3) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const pairs = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['nose', 'left_shoulder'],
    ['nose', 'right_shoulder'],
  ];
  pairs.forEach(([a, b]) => {
    const pointA = keypoints.find((p) => p.name === a);
    const pointB = keypoints.find((p) => p.name === b);
    if (pointA?.score > 0.3 && pointB?.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.stroke();
    }
  });
}

function getKeypoint(keypoints, name) {
  return keypoints.find((point) => point.name === name) || null;
}

function estimatePosture(keypoints) {
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const rightHip = getKeypoint(keypoints, 'right_hip');
  const nose = getKeypoint(keypoints, 'nose');

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !nose) {
    return '還沒偵測到完整姿勢，請調整鏡頭位置並維持身體完整進入畫面。';
  }

  const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderAvgX = (leftShoulder.x + rightShoulder.x) / 2;
  const hipAvgX = (leftHip.x + rightHip.x) / 2;
  const hipAvgY = (leftHip.y + rightHip.y) / 2;
  const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2;

  const shoulderSlope = Math.abs((shoulderAvgY - hipAvgY) / (shoulderAvgX - hipAvgX + 0.0001));
  const headForwardDistance = nose.x - shoulderAvgX;
  const headForwardThreshold = overlay.width * 0.08;

  if (shoulderYDiff > overlay.height * 0.04) {
    return '你的肩膀高度不太平衡，建議放鬆肩膀並檢查姿勢。';
  }

  if (Math.abs(headForwardDistance) > headForwardThreshold) {
    return '你的姿勢看起來像是烏龜頸，請將頭部稍微往後收，保持頸部直立。';
  }

  if (shoulderSlope < 0.5) {
    return '你的姿勢看起來駝背，請把背部挺直、收肩。';
  }

  return '姿勢良好，繼續保持！';
}

async function runPoseLoop() {
  if (!detector) {
    feedback.textContent = '姿勢偵測模型尚未準備好。';
    return;
  }

  const ctx = overlay.getContext('2d');
  const detectFrame = async () => {
    if (video.paused || video.ended) {
      return;
    }

    try {
      const poses = await detector.estimatePoses(video, { maxPoses: 1, flipHorizontal: false });
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        drawKeypoints(keypoints);
        feedback.textContent = estimatePosture(keypoints);
      } else {
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        feedback.textContent = '尚未偵測到姿勢，請進入鏡頭範圍。';
      }
    } catch (error) {
      console.error(error);
      feedback.textContent = '偵測時發生錯誤，請重新整理頁面。';
    }

    requestAnimationFrame(detectFrame);
  };
  detectFrame();
}

startButton.addEventListener('click', startCamera);
initDetector();
