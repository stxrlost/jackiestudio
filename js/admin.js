/* Jackie Studio — Admin Panel JavaScript */

(function () {
  var REPO = 'stxrlost/jackiestudio';
  var API = 'https://api.github.com';
  var token = '';
  var contentData = null;
  var contentSha = '';

  // Local preview URLs so images show immediately after upload
  var previews = {};

  // --- GitHub API ---

  function apiGet(path) {
    return fetch(API + path, {
      headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' }
    }).then(function (r) {
      if (!r.ok) throw new Error('GitHub API error: ' + r.status);
      return r.json();
    });
  }

  function apiPut(path, body) {
    return fetch(API + path, {
      method: 'PUT',
      headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('GitHub API error: ' + r.status);
      return r.json();
    });
  }

  function loadContent() {
    return apiGet('/repos/' + REPO + '/contents/data/content.json?ref=main').then(function (data) {
      contentSha = data.sha;
      contentData = JSON.parse(atob(data.content));
      return contentData;
    });
  }

  function saveContent(message) {
    return apiPut('/repos/' + REPO + '/contents/data/content.json', {
      message: message || 'Update site content',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(contentData, null, 2)))),
      sha: contentSha,
      branch: 'main'
    }).then(function (result) {
      contentSha = result.content.sha;
      return result;
    });
  }

  function uploadImage(path, file, message) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var maxW = 1200;
          var w = img.width;
          var h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          apiPut('/repos/' + REPO + '/contents/' + path, {
            message: message || 'Upload image',
            content: base64,
            branch: 'main'
          }).then(resolve).catch(reject);
        };
        img.onerror = function () { reject(new Error('Invalid image')); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error('Failed to read file')); };
      reader.readAsDataURL(file);
    });
  }

  // Get display URL — use local preview if available, otherwise deployed path
  function displayUrl(path) {
    if (previews[path]) return previews[path];
    return path;
  }

  // --- Toast ---

  function toast(msg, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 3500);
  }

  // --- Confirm ---

  function confirm(msg) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML =
        '<div class="confirm-dialog">' +
        '<p>' + msg + '</p>' +
        '<div class="btn-row">' +
        '<button class="btn btn-secondary btn-sm" id="confirmNo">Cancel</button>' +
        '<button class="btn btn-danger" id="confirmYes">Delete</button>' +
        '</div></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('#confirmNo').onclick = function () { overlay.remove(); resolve(false); };
      overlay.querySelector('#confirmYes').onclick = function () { overlay.remove(); resolve(true); };
      overlay.addEventListener('click', function (e) { if (e.target === overlay) { overlay.remove(); resolve(false); } });
    });
  }

  // --- Navigation ---

  function showPage(name) {
    document.querySelectorAll('.editor-page').forEach(function (p) { p.classList.remove('active'); });
    var page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');
  }

  function showDashboard() {
    showPage('dashboard');
  }

  // --- Login ---

  function initLogin() {
    var saved = localStorage.getItem('jackie_admin_token');
    if (saved) {
      token = saved;
      verifyToken();
    }

    document.getElementById('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      token = document.getElementById('tokenInput').value.trim();
      if (!token) return;
      verifyToken();
    });
  }

  function verifyToken() {
    document.getElementById('loginBtn').disabled = true;
    document.getElementById('loginBtn').textContent = 'Logging in...';
    fetch(API + '/user', { headers: { 'Authorization': 'token ' + token } })
      .then(function (r) {
        if (!r.ok) throw new Error('Invalid token');
        return r.json();
      })
      .then(function () {
        localStorage.setItem('jackie_admin_token', token);
        document.getElementById('loginWrapper').style.display = 'none';
        document.getElementById('appWrapper').classList.add('active');
        toast('Logged in!', 'success');
        loadContent().then(renderDashboard).catch(function () { toast('Failed to load content', 'error'); });
      })
      .catch(function () {
        toast('Invalid token. Try again.', 'error');
        localStorage.removeItem('jackie_admin_token');
        document.getElementById('loginBtn').disabled = false;
        document.getElementById('loginBtn').textContent = 'Login';
      });
  }

  function logout() {
    localStorage.removeItem('jackie_admin_token');
    token = '';
    previews = {};
    document.getElementById('appWrapper').classList.remove('active');
    document.getElementById('loginWrapper').style.display = '';
    document.getElementById('tokenInput').value = '';
    document.getElementById('loginBtn').disabled = false;
    document.getElementById('loginBtn').textContent = 'Login';
  }

  // --- Dashboard ---

  function renderDashboard() {
    showDashboard();
  }

  // --- Gallery Editor ---

  function renderGallery() {
    showPage('gallery');
    var container = document.getElementById('galleryList');
    if (!contentData.gallery) contentData.gallery = [];

    container.innerHTML = contentData.gallery.map(function (item, i) {
      var src = item.image ? displayUrl(item.image) : '';
      var thumb = src
        ? '<img src="' + esc(src) + '" alt="">'
        : '<span class="placeholder-icon">🖼</span>';
      var uploadContent = src
        ? '<img src="' + esc(src) + '" alt="">'
        : '<div class="upload-icon">📷</div><div class="upload-text">Tap to upload image</div>';
      return '<div class="item-card">' +
        '<div class="item-card-header">' +
        '<div class="item-card-thumb">' + thumb + '</div>' +
        '<div style="flex:1;min-width:0">' +
        '<h4>' + esc(item.caption) + '</h4>' +
        '<span style="font-size:0.8rem;color:var(--text-light)">' + esc(item.category) + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Caption</label>' +
        '<input type="text" data-gallery="' + i + '" data-field="caption" value="' + esc(item.caption) + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Category</label>' +
        '<select data-gallery="' + i + '" data-field="category">' +
        '<option' + (item.category === 'Drawing' ? ' selected' : '') + '>Drawing</option>' +
        '<option' + (item.category === 'Fashion' ? ' selected' : '') + '>Fashion</option>' +
        '<option' + (item.category === 'Writing' ? ' selected' : '') + '>Writing</option>' +
        '<option' + (item.category === 'Video' ? ' selected' : '') + '>Video</option>' +
        '<option' + (item.category === 'Other' ? ' selected' : '') + '>Other</option>' +
        '</select>' +
        '</div>' +
        '<div class="upload-area' + (src ? ' has-image' : '') + '" data-gallery-upload="' + i + '">' +
        uploadContent +
        '<input type="file" accept="image/*" style="display:none" data-gallery-file="' + i + '">' +
        '</div>' +
        '<div class="item-card-actions">' +
        '<button class="btn btn-danger btn-sm" data-gallery-delete="' + i + '">Delete</button>' +
        '</div></div>';
    }).join('');

    // Bind events
    container.querySelectorAll('[data-gallery]').forEach(function (el) {
      el.addEventListener('change', function () {
        var idx = parseInt(this.dataset.gallery);
        contentData.gallery[idx][this.dataset.field] = this.value;
      });
    });

    container.querySelectorAll('[data-gallery-upload]').forEach(function (el) {
      el.addEventListener('click', function () {
        this.querySelector('input[type=file]').click();
      });
    });

    container.querySelectorAll('[data-gallery-file]').forEach(function (el) {
      el.addEventListener('change', function () {
        var file = this.files[0];
        if (!file) return;
        var idx = parseInt(this.dataset.galleryFile);
        var filename = 'gallery-' + Date.now() + '.jpg';
        var imagePath = 'assets/images/gallery/' + filename;

        // Show local preview immediately
        var localUrl = URL.createObjectURL(file);
        previews[imagePath] = localUrl;
        contentData.gallery[idx].image = imagePath;
        renderGallery();

        toast('Uploading image...', 'info');
        uploadImage(imagePath, file, 'Upload gallery image').then(function () {
          toast('Image uploaded! Tap Save to publish.', 'success');
        }).catch(function () {
          delete previews[imagePath];
          contentData.gallery[idx].image = '';
          renderGallery();
          toast('Upload failed', 'error');
        });
      });
    });

    container.querySelectorAll('[data-gallery-delete]').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.galleryDelete);
        confirm('Delete "' + contentData.gallery[idx].caption + '"?').then(function (yes) {
          if (yes) {
            contentData.gallery.splice(idx, 1);
            renderGallery();
          }
        });
      });
    });
  }

  function addGalleryItem() {
    contentData.gallery.push({
      id: String(Date.now()),
      image: '',
      caption: 'New Art',
      category: 'Drawing'
    });
    renderGallery();
    toast('New item added! Scroll down to edit.', 'info');
  }

  // --- Video Editor ---

  function renderVideos() {
    showPage('videos');
    var container = document.getElementById('videosList');
    if (!contentData.videos) contentData.videos = [];

    container.innerHTML = contentData.videos.map(function (v, i) {
      return '<div class="item-card">' +
        '<div class="item-card-header"><h4>' + esc(v.title) + '</h4></div>' +
        '<div class="form-group">' +
        '<label>Title</label>' +
        '<input type="text" data-video="' + i + '" data-field="title" value="' + esc(v.title) + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>YouTube URL or Video ID</label>' +
        '<input type="text" data-video-url="' + i + '" value="' + esc(v.youtubeId ? 'https://youtube.com/watch?v=' + v.youtubeId : '') + '" placeholder="https://youtube.com/watch?v=...">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Description</label>' +
        '<textarea data-video="' + i + '" data-field="description">' + esc(v.description) + '</textarea>' +
        '</div>' +
        '<div class="item-card-actions">' +
        '<button class="btn btn-danger btn-sm" data-video-delete="' + i + '">Delete</button>' +
        '</div></div>';
    }).join('');

    container.querySelectorAll('[data-video]').forEach(function (el) {
      el.addEventListener('change', function () {
        var idx = parseInt(this.dataset.video);
        contentData.videos[idx][this.dataset.field] = this.value;
      });
    });

    container.querySelectorAll('[data-video-url]').forEach(function (el) {
      el.addEventListener('change', function () {
        var idx = parseInt(this.dataset.videoUrl);
        var val = this.value.trim();
        var id = extractYoutubeId(val);
        contentData.videos[idx].youtubeId = id || '';
      });
    });

    container.querySelectorAll('[data-video-delete]').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.videoDelete);
        confirm('Delete "' + contentData.videos[idx].title + '"?').then(function (yes) {
          if (yes) {
            contentData.videos.splice(idx, 1);
            renderVideos();
          }
        });
      });
    });
  }

  function extractYoutubeId(url) {
    if (!url) return '';
    var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : (url.length === 11 ? url : '');
  }

  function addVideo() {
    contentData.videos.push({
      id: String(Date.now()),
      youtubeId: '',
      title: 'New Video',
      description: ''
    });
    renderVideos();
    toast('New video added!', 'info');
  }

  // --- About Editor ---

  function renderAbout() {
    showPage('about');
    var container = document.getElementById('aboutList');
    if (!contentData.about) contentData.about = { paragraphs: [] };

    container.innerHTML = contentData.about.paragraphs.map(function (p, i) {
      return '<div class="item-card">' +
        '<div class="item-card-header"><h4>Paragraph ' + (i + 1) + '</h4>' +
        '<button class="btn btn-danger btn-sm" data-about-delete="' + i + '">Remove</button></div>' +
        '<div class="form-group">' +
        '<textarea data-about="' + i + '" rows="3">' + esc(p) + '</textarea>' +
        '</div></div>';
    }).join('');

    container.querySelectorAll('[data-about]').forEach(function (el) {
      el.addEventListener('change', function () {
        contentData.about.paragraphs[parseInt(this.dataset.about)] = this.value;
      });
    });

    container.querySelectorAll('[data-about-delete]').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.aboutDelete);
        contentData.about.paragraphs.splice(idx, 1);
        renderAbout();
      });
    });
  }

  function addAboutParagraph() {
    contentData.about.paragraphs.push('New paragraph...');
    renderAbout();
  }

  // --- Personal Editor ---

  function renderPersonal() {
    showPage('personal');
    var container = document.getElementById('personalList');
    if (!contentData.personal) contentData.personal = [];

    container.innerHTML = contentData.personal.map(function (card, i) {
      var src = card.image ? displayUrl(card.image) : '';
      var thumb = src
        ? '<img src="' + esc(src) + '" alt="">'
        : '<span class="placeholder-icon">📷</span>';
      var uploadContent = src
        ? '<img src="' + esc(src) + '" alt="">'
        : '<div class="upload-icon">📷</div><div class="upload-text">Tap to upload image</div>';
      return '<div class="item-card">' +
        '<div class="item-card-header">' +
        '<div class="item-card-thumb">' + thumb + '</div>' +
        '<h4>' + esc(card.title) + '</h4></div>' +
        '<div class="form-group">' +
        '<label>Title</label>' +
        '<input type="text" data-personal="' + i + '" data-field="title" value="' + esc(card.title) + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Description</label>' +
        '<textarea data-personal="' + i + '" data-field="description" rows="3">' + esc(card.description) + '</textarea>' +
        '</div>' +
        '<div class="upload-area' + (src ? ' has-image' : '') + '" data-personal-upload="' + i + '">' +
        uploadContent +
        '<input type="file" accept="image/*" style="display:none" data-personal-file="' + i + '">' +
        '</div>' +
        '<div class="item-card-actions">' +
        '<button class="btn btn-danger btn-sm" data-personal-delete="' + i + '">Delete</button>' +
        '</div></div>';
    }).join('');

    container.querySelectorAll('[data-personal]').forEach(function (el) {
      el.addEventListener('change', function () {
        var idx = parseInt(this.dataset.personal);
        contentData.personal[idx][this.dataset.field] = this.value;
      });
    });

    container.querySelectorAll('[data-personal-upload]').forEach(function (el) {
      el.addEventListener('click', function () {
        this.querySelector('input[type=file]').click();
      });
    });

    container.querySelectorAll('[data-personal-file]').forEach(function (el) {
      el.addEventListener('change', function () {
        var file = this.files[0];
        if (!file) return;
        var idx = parseInt(this.dataset.personalFile);
        var filename = 'personal-' + Date.now() + '.jpg';
        var imagePath = 'assets/images/personal/' + filename;

        // Show local preview immediately
        var localUrl = URL.createObjectURL(file);
        previews[imagePath] = localUrl;
        contentData.personal[idx].image = imagePath;
        renderPersonal();

        toast('Uploading image...', 'info');
        uploadImage(imagePath, file, 'Upload personal image').then(function () {
          toast('Image uploaded! Tap Save to publish.', 'success');
        }).catch(function () {
          delete previews[imagePath];
          contentData.personal[idx].image = '';
          renderPersonal();
          toast('Upload failed', 'error');
        });
      });
    });

    container.querySelectorAll('[data-personal-delete]').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.personalDelete);
        confirm('Delete "' + contentData.personal[idx].title + '"?').then(function (yes) {
          if (yes) {
            contentData.personal.splice(idx, 1);
            renderPersonal();
          }
        });
      });
    });
  }

  function addPersonalCard() {
    contentData.personal.push({
      id: String(Date.now()),
      image: '',
      title: 'New Card',
      description: ''
    });
    renderPersonal();
    toast('New card added!', 'info');
  }

  // --- Social Editor ---

  function renderSocial() {
    showPage('social');
    document.getElementById('socialYoutube').value = contentData.social.youtube || '';
    document.getElementById('socialWhatsapp').value = contentData.social.whatsapp || '';
  }

  function saveSocial() {
    contentData.social.youtube = document.getElementById('socialYoutube').value.trim();
    contentData.social.whatsapp = document.getElementById('socialWhatsapp').value.trim();
    doSave('Update social links');
  }

  // --- Save ---

  function doSave(msg) {
    toast('Saving...', 'info');
    saveContent(msg).then(function () {
      toast('Saved! Your site will update in ~1 minute.', 'success');
    }).catch(function (err) {
      toast('Save failed: ' + err.message, 'error');
    });
  }

  // --- Utility ---

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // --- Init ---

  document.addEventListener('DOMContentLoaded', function () {
    initLogin();

    // Dashboard navigation
    document.querySelectorAll('[data-navigate]').forEach(function (el) {
      el.addEventListener('click', function () {
        var page = this.dataset.navigate;
        if (page === 'gallery') renderGallery();
        else if (page === 'videos') renderVideos();
        else if (page === 'about') renderAbout();
        else if (page === 'personal') renderPersonal();
        else if (page === 'social') renderSocial();
      });
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(function (el) {
      el.addEventListener('click', showDashboard);
    });

    // Add buttons
    document.getElementById('addGalleryBtn').addEventListener('click', addGalleryItem);
    document.getElementById('addVideoBtn').addEventListener('click', addVideo);
    document.getElementById('addAboutBtn').addEventListener('click', addAboutParagraph);
    document.getElementById('addPersonalBtn').addEventListener('click', addPersonalCard);

    // Save buttons
    document.getElementById('saveGalleryBtn').addEventListener('click', function () { doSave('Update gallery'); });
    document.getElementById('saveVideosBtn').addEventListener('click', function () { doSave('Update videos'); });
    document.getElementById('saveAboutBtn').addEventListener('click', function () { doSave('Update about'); });
    document.getElementById('savePersonalBtn').addEventListener('click', function () { doSave('Update personal'); });
    document.getElementById('saveSocialBtn').addEventListener('click', saveSocial);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
  });
})();
