// ================================================================
//  ACIDIC REWARDS — complete rewrite
//  • All data stored per signed-in user (email-keyed)
//  • Renders its own HTML so it works in the section AND modal
//  • createUserWithRewards / displayUserRewards defined here
//  • Points only awarded to signed-in users
// ================================================================

// ── Storage helpers ───────────────────────────────────────────────

function _getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch(e) { return null; }
}

function _rewardKey() {
    var u = _getCurrentUser();
    if (!u || !u.email) return null;
    return 'ar_' + u.email.replace(/[^a-zA-Z0-9]/g, '_');
}

function _loadRewardData() {
    var k = _rewardKey();
    if (!k) return null;
    try { return JSON.parse(localStorage.getItem(k)) || { points: 0, tier: 'Bronze', orders: [] }; }
    catch(e) { return { points: 0, tier: 'Bronze', orders: [] }; }
}

function _saveRewardData(data) {
    var k = _rewardKey();
    if (!k) return;
    localStorage.setItem(k, JSON.stringify(data));

    var user = _getCurrentUser();
    if (user) {
        user.points = data.points;
        user.tier   = data.tier;
        localStorage.setItem('currentUser', JSON.stringify(user));

        var users = JSON.parse(localStorage.getItem('acidicUsers') || '[]');
        var idx   = users.findIndex(function(u) { return u.email === user.email; });
        if (idx > -1) { users[idx].points = data.points; users[idx].tier = data.tier; }
        localStorage.setItem('acidicUsers', JSON.stringify(users));
    }
}

// ── Tier logic ────────────────────────────────────────────────────

function _calcTier(pts) {
    if (pts >= 500) return 'Gold';
    if (pts >= 200) return 'Silver';
    return 'Bronze';
}

function _tierProgress(pts) {
    if (pts >= 500) return { next: null, needed: 0, pct: 100 };
    if (pts >= 200) return { next: 'Gold',   needed: 500 - pts, pct: Math.round(((pts - 200) / 300) * 100) };
    return              { next: 'Silver', needed: 200 - pts, pct: Math.round((pts / 200) * 100) };
}

// ── Required by auth.js ────────────────────────────────────────────

function createUserWithRewards(userObj) {
    return Object.assign({}, userObj, {
        points:   userObj.points   || 0,
        tier:     userObj.tier     || 'Bronze',
        joinedAt: userObj.joinedAt || new Date().toISOString()
    });
}

function displayUserRewards() {
    renderLoyaltyPage();
}

// ── Required by main.js ────────────────────────────────────────────

function updateUserRewards(pointsEarned) {
    var user = _getCurrentUser();
    if (!user) return;

    var data    = _loadRewardData() || { points: 0, tier: 'Bronze', orders: [] };
    data.points += pointsEarned;
    data.tier    = _calcTier(data.points);
    _saveRewardData(data);
    renderLoyaltyPage();

    if (typeof showNotification === 'function') {
        showNotification('You earned ' + pointsEarned + ' reward points!', 'success');
    }
}

function getUserPoints() {
    var data = _loadRewardData();
    return data ? data.points : 0;
}

function saveOrderToHistory(totalAmount, transactionId) {
    var user    = _getCurrentUser();
    var orderId = transactionId || ('ORD-' + Date.now().toString().slice(-8));
    var cartArr = (typeof cart !== 'undefined') ? cart.slice() : [];
    var pts     = Math.floor(totalAmount / 10);

    var order = {
        id:           orderId,
        date:         new Date().toISOString(),
        items:        cartArr,
        total:        totalAmount,
        status:       'Processing',
        pointsEarned: pts
    };

    var global = JSON.parse(localStorage.getItem('userOrders') || '[]');
    global.unshift(order);
    localStorage.setItem('userOrders', JSON.stringify(global));

    if (user) {
        var data    = _loadRewardData() || { points: 0, tier: 'Bronze', orders: [] };
        data.orders = data.orders || [];
        data.orders.unshift(order);
        if (data.orders.length > 20) data.orders = data.orders.slice(0, 20);
        _saveRewardData(data);
    }

    if (typeof updateOrderHistoryDisplay === 'function') updateOrderHistoryDisplay();
    renderLoyaltyPage();
    return pts;
}

function updateTierProgress() { renderLoyaltyPage(); }

// ── Core render ────────────────────────────────────────────────────

function renderLoyaltyPage() {
    var section = document.getElementById('loyalty-program');
    if (!section) return;

    var wrap = section.querySelector('.loyalty-container');
    if (!wrap) {
        section.innerHTML = '<div class="loyalty-container"></div>';
        wrap = section.querySelector('.loyalty-container');
    }

    var user = _getCurrentUser();

    if (!user) {
        wrap.innerHTML =
            '<h2 style="text-align:center;margin:0 0 20px;">ACIDIC Rewards</h2>' +
            '<div style="text-align:center;padding:36px 20px;background:#f8f9fa;border-radius:14px;margin-bottom:24px;">' +
                '<div style="font-size:52px;margin-bottom:12px;">&#128274;</div>' +
                '<h3 style="margin:0 0 8px;">Sign In to Earn Rewards</h3>' +
                '<p style="color:#888;margin:0 0 22px;">Create an account or sign in to start earning points with every purchase.</p>' +
                '<button onclick="showSignUp()" style="background:#000;color:#fff;border:none;padding:11px 26px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;margin-right:10px;">Sign Up</button>' +
                '<button onclick="showLogin()" style="background:#f4b400;color:#000;border:none;padding:11px 26px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">Sign In</button>' +
            '</div>' +
            _tierCardsHTML(null);
        return;
    }

    var data  = _loadRewardData() || { points: 0, tier: 'Bronze', orders: [] };
    var tier  = _calcTier(data.points);
    var prog  = _tierProgress(data.points);
    var tc    = { Bronze: '#cd7f32', Silver: '#a8a9ad', Gold: '#f4b400' };
    var col   = tc[tier] || '#f4b400';

    wrap.innerHTML =
        '<h2 style="text-align:center;margin:0 0 20px;">ACIDIC Rewards</h2>' +

        '<div style="background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);color:#fff;border-radius:16px;padding:24px;margin-bottom:20px;position:relative;overflow:hidden;">' +
            '<div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:' + col + ';border-radius:50%;opacity:0.12;pointer-events:none;"></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">' +
                '<div>' +
                    '<p style="margin:0 0 4px;opacity:0.6;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Welcome back</p>' +
                    '<h3 style="margin:0 0 8px;font-size:22px;">' + (user.name || 'Member') + '</h3>' +
                    '<span style="background:' + col + ';color:#000;padding:3px 14px;border-radius:20px;font-size:12px;font-weight:700;">' + tier + ' Member</span>' +
                '</div>' +
                '<div style="text-align:right;">' +
                    '<p style="margin:0 0 2px;opacity:0.6;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Points</p>' +
                    '<p style="margin:0;font-size:40px;font-weight:900;color:' + col + ';line-height:1;">' + data.points + '</p>' +
                '</div>' +
            '</div>' +
            '<div style="margin-top:20px;">' +
                (prog.next
                    ? '<div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.7;margin-bottom:6px;"><span>' + tier + '</span><span>' + prog.needed + ' pts to ' + prog.next + '</span><span>' + prog.next + '</span></div>' +
                      '<div style="background:rgba(255,255,255,0.15);border-radius:10px;height:7px;overflow:hidden;"><div style="background:' + col + ';height:100%;width:' + prog.pct + '%;border-radius:10px;"></div></div>'
                    : '<p style="text-align:center;opacity:0.9;font-size:14px;margin:0;">&#127942; You\'ve reached the highest tier!</p>'
                ) +
            '</div>' +
        '</div>' +

        _tierCardsHTML(tier) +

        '<div style="background:#fffdf0;border:1px solid #f4b400;border-radius:12px;padding:16px;margin-bottom:20px;">' +
            '<h4 style="margin:0 0 10px;font-size:14px;">Your Current Benefits</h4>' +
            _benefitsHTML(tier) +
        '</div>' +

        '<div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:16px;">' +
            '<h4 style="margin:0 0 14px;font-size:14px;">Order History</h4>' +
            '<div style="max-height:260px;overflow-y:auto;" id="order-history-list">' +
                _orderHistoryHTML(data.orders) +
            '</div>' +
        '</div>';
}

function _tierCardsHTML(activeTier) {
    var tiers = [
        { name:'Bronze', pts:0,   icon:'&#129353;', col:'#cd7f32', perks:['10% off next purchase','Early sale access'] },
        { name:'Silver', pts:200, icon:'&#129352;', col:'#a8a9ad', perks:['10% off all purchases','Free delivery','Early sale access'] },
        { name:'Gold',   pts:500, icon:'&#129351;', col:'#f4b400', perks:['10% off all purchases','Free express delivery','Exclusive drops','Birthday gift'] }
    ];
    var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">';
    tiers.forEach(function(t) {
        var active = activeTier === t.name;
        html +=
            '<div style="border-radius:12px;padding:14px;border:2px solid ' + (active ? t.col : '#eee') + ';background:' + (active ? t.col + '18' : '#fafafa') + ';' + (active ? 'transform:scale(1.02);box-shadow:0 4px 12px rgba(0,0,0,0.08);' : '') + '">' +
                '<div style="font-size:22px;margin-bottom:6px;">' + t.icon + '</div>' +
                '<p style="font-weight:800;margin:0 0 2px;font-size:14px;color:' + t.col + ';">' + t.name + '</p>' +
                '<p style="margin:0 0 8px;font-size:11px;color:#999;">' + (t.pts === 0 ? 'Starting tier' : t.pts + '+ pts') + '</p>' +
                '<ul style="margin:0;padding-left:14px;font-size:11px;color:#555;line-height:1.9;">' +
                    t.perks.map(function(p) { return '<li>' + p + '</li>'; }).join('') +
                '</ul>' +
            '</div>';
    });
    return html + '</div>';
}

function _benefitsHTML(tier) {
    var b = {
        Bronze: ['10% off your next purchase','Early sale access'],
        Silver: ['10% off all purchases','Free delivery on all orders','Early sale access'],
        Gold:   ['10% off all purchases','Free express delivery','Exclusive drops','Birthday gift','Priority support']
    };
    return (b[tier] || b.Bronze).map(function(item) {
        return '<p style="margin:0 0 6px;font-size:13px;">&#10003; ' + item + '</p>';
    }).join('');
}

function _orderHistoryHTML(orders) {
    if (!orders || !orders.length) {
        return '<p style="text-align:center;color:#bbb;padding:20px 0;font-size:13px;">No orders yet</p>';
    }
    return orders.map(function(o) {
        var date = '';
        try { date = new Date(o.date).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' }); } catch(e) { date = o.date || ''; }
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">' +
            '<div><p style="margin:0 0 2px;font-weight:700;font-size:13px;">' + o.id + '</p><p style="margin:0;font-size:11px;color:#aaa;">' + date + '</p></div>' +
            '<div style="text-align:right;"><p style="margin:0 0 3px;font-weight:700;font-size:13px;">R' + o.total + '</p><span style="background:#f4b400;color:#000;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">+' + (o.pointsEarned || Math.floor(o.total / 10)) + ' pts</span></div>' +
        '</div>';
    }).join('');
}

// ── showLoyaltyProgram ─────────────────────────────────────────────

function showLoyaltyProgram() {
    if (typeof hideAllSections === 'function') hideAllSections();
    var section = document.getElementById('loyalty-program');
    if (section) {
        section.style.display = 'block';
        renderLoyaltyPage();
    }
}

// ── Redeem modal ───────────────────────────────────────────────────

function showRedeemPointsModal() {
    var user = _getCurrentUser();
    if (!user) {
        if (typeof showNotification === 'function') showNotification('Please sign in to redeem points', 'error');
        return;
    }
    var data = _loadRewardData() || { points: 0 };
    var ex   = document.getElementById('redeem-modal');
    if (ex) ex.remove();

    var modal = document.createElement('div');
    modal.id  = 'redeem-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML =
        '<div style="background:#fff;border-radius:16px;padding:28px;width:90%;max-width:360px;position:relative;">' +
            '<button onclick="document.getElementById(\'redeem-modal\').remove()" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;">&#10005;</button>' +
            '<h3 style="margin:0 0 6px;">Redeem Points</h3>' +
            '<p style="color:#888;font-size:13px;margin:0 0 18px;">You have <strong>' + data.points + ' points</strong> &middot; 10 pts = R1 discount</p>' +
            '<label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Points to redeem (min 10)</label>' +
            '<input type="number" id="redeem-input" min="10" max="' + data.points + '" step="10" value="' + Math.min(100, data.points) + '" style="width:100%;padding:10px;border:2px solid #eee;border-radius:8px;font-size:15px;box-sizing:border-box;margin-bottom:6px;">' +
            '<p style="color:#f4b400;font-size:13px;margin:0 0 16px;" id="redeem-preview">= R' + Math.min(10, Math.floor(data.points / 10)) + ' discount</p>' +
            '<div id="redeem-msg" style="display:none;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px;"></div>' +
            '<button onclick="applyRedemption()" style="width:100%;padding:13px;background:#000;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">Apply Discount</button>' +
        '</div>';

    modal.querySelector('#redeem-input').addEventListener('input', function() {
        var d = Math.floor((parseInt(this.value) || 0) / 10);
        document.getElementById('redeem-preview').textContent = '= R' + d + ' discount';
    });

    document.body.appendChild(modal);
}

function applyRedemption() {
    var pts  = parseInt(document.getElementById('redeem-input') && document.getElementById('redeem-input').value) || 0;
    var msg  = document.getElementById('redeem-msg');
    var data = _loadRewardData() || { points: 0, tier: 'Bronze', orders: [] };

    if (pts < 10)          { _showRedeemMsg(msg, false, 'Minimum 10 points to redeem'); return; }
    if (pts > data.points) { _showRedeemMsg(msg, false, 'Not enough points');           return; }

    var discount = Math.floor(pts / 10);
    data.points -= pts;
    data.tier    = _calcTier(data.points);
    _saveRewardData(data);
    renderLoyaltyPage();
    _showRedeemMsg(msg, true, 'R' + discount + ' discount applied!');

    var totalEl = document.getElementById('cart-total');
    if (totalEl) {
        var cur = parseFloat(totalEl.textContent.replace(/[^0-9.]/g, '')) || 0;
        totalEl.textContent = 'R' + Math.max(0, cur - discount).toFixed(2);
    }

    setTimeout(function() {
        var m = document.getElementById('redeem-modal');
        if (m) m.remove();
    }, 1600);
}

function _showRedeemMsg(el, ok, text) {
    if (!el) return;
    el.style.display    = 'block';
    el.style.background = ok ? '#e8f5e9' : '#ffebee';
    el.style.color      = ok ? '#2e7d32'  : '#c62828';
    el.textContent      = text;
}

// ── Global exports ─────────────────────────────────────────────────
window.createUserWithRewards  = createUserWithRewards;
window.displayUserRewards     = displayUserRewards;
window.updateUserRewards      = updateUserRewards;
window.getUserPoints          = getUserPoints;
window.saveOrderToHistory     = saveOrderToHistory;
window.showLoyaltyProgram     = showLoyaltyProgram;
window.updateTierProgress     = updateTierProgress;
window.renderLoyaltyPage      = renderLoyaltyPage;
window.showRedeemPointsModal  = showRedeemPointsModal;
window.applyRedemption        = applyRedemption;