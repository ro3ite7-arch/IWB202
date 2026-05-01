/* ===== myFunctions.js - ملف التوابع الرئيسي ===== */

$(document).ready(function () {

    // --- إخفاء جميع صفوف التفاصيل عند التحميل ---
    $(".details-row").hide();

    // --- إظهار / إخفاء تفاصيل الوجبة عند الضغط على مربع الاختيار ---
    $(".chk-details").on("change", function () {
        var mealId = $(this).data("meal");
        var $detailsRow = $("#details-" + mealId);
        var $detailsDiv = $("#meal-details-" + mealId);

        if ($(this).is(":checked")) {
            $detailsRow.show();
            $detailsDiv.slideDown(300);
        } else {
            $detailsDiv.slideUp(300, function () {
                $detailsRow.hide();
            });
        }
    });

});


// ===== إظهار نموذج الطلب =====
function showOrderForm() {
    // التحقق من اختيار وجبة واحدة على الأقل
    var selectedCount = $(".chk-select:checked").length;

    if (selectedCount === 0) {
        $("#alert-no-selection").slideDown(300);
        setTimeout(function () {
            $("#alert-no-selection").slideUp(300);
        }, 3000);
        return;
    }

    $("#alert-no-selection").hide();

    // إظهار النموذج مع تمرير سلس
    $("#order-form").slideDown(400, function () {
        $("html, body").animate({
            scrollTop: $("#order-form").offset().top - 100
        }, 500);
    });
}


// ===== التحقق من صحة المدخلات وإرسال الطلب =====
function submitOrder() {
    var isValid = true;
    var errors = [];

    // إخفاء جميع رسائل الخطأ
    $(".error-msg").hide();
    $("input").removeClass("invalid valid");
    $("#alert-form-error").hide();
    $("#alert-form-success").hide();

    // --- 1. التحقق من الاسم الكامل (اختياري - أحرف عربية فقط) ---
    var fullName = $.trim($("#fullName").val());
    if (fullName !== "") {
        var arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/;
        if (!arabicPattern.test(fullName)) {
            showFieldError("fullName", "err-name", "الاسم يجب أن يحتوي على أحرف عربية فقط.");
            errors.push("الاسم الكامل");
            isValid = false;
        } else {
            $("#fullName").addClass("valid");
        }
    }

    // --- 2. التحقق من الرقم الوطني (إجباري) ---
    var nationalId = $.trim($("#nationalId").val());
    if (nationalId === "") {
        showFieldError("nationalId", "err-nid", "الرقم الوطني إجباري.");
        errors.push("الرقم الوطني");
        isValid = false;
    } else {
        var nidPattern = /^\d{11}$/;
        if (!nidPattern.test(nationalId)) {
            showFieldError("nationalId", "err-nid", "الرقم الوطني يجب أن يتكون من 11 خانة رقمية.");
            errors.push("الرقم الوطني");
            isValid = false;
        } else {
            var govCode = parseInt(nationalId.substring(0, 2));
            if (govCode < 1 || govCode > 14) {
                showFieldError("nationalId", "err-nid", "أول خانتين يجب أن تكونا بين 01 و 14 (رمز المحافظة).");
                errors.push("الرقم الوطني");
                isValid = false;
            } else {
                $("#nationalId").addClass("valid");
            }
        }
    }

    // --- 3. التحقق من تاريخ الولادة (اختياري - dd-mm-yyyy) ---
    var birthDate = $.trim($("#birthDate").val());
    if (birthDate !== "") {
        var datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
        var dateMatch = birthDate.match(datePattern);
        if (!dateMatch) {
            showFieldError("birthDate", "err-bdate", "الصيغة المطلوبة: dd-mm-yyyy");
            errors.push("تاريخ الولادة");
            isValid = false;
        } else {
            var day = parseInt(dateMatch[1]);
            var month = parseInt(dateMatch[2]);
            var year = parseInt(dateMatch[3]);
            var testDate = new Date(year, month - 1, day);

            if (testDate.getDate() !== day || testDate.getMonth() !== month - 1 || testDate.getFullYear() !== year ||
                year < 1920 || year > 2010) {
                showFieldError("birthDate", "err-bdate", "تاريخ غير صالح. تأكد من صحة اليوم والشهر والسنة.");
                errors.push("تاريخ الولادة");
                isValid = false;
            } else {
                $("#birthDate").addClass("valid");
            }
        }
    }

    // --- 4. التحقق من رقم الموبايل (اختياري - Syriatel أو MTN) ---
    var mobile = $.trim($("#mobile").val());
    if (mobile !== "") {
        // Syriatel: 093, 094, 098 | MTN: 095, 096, 099
        var mobilePattern = /^(093|094|095|096|098|099)\d{7}$/;
        if (!mobilePattern.test(mobile)) {
            showFieldError("mobile", "err-mobile", "رقم الموبايل يجب أن يبدأ بـ 093 أو 094 أو 095 أو 096 أو 098 أو 099 ويتكون من 10 أرقام.");
            errors.push("رقم الموبايل");
            isValid = false;
        } else {
            $("#mobile").addClass("valid");
        }
    }

    // --- 5. التحقق من البريد الإلكتروني (اختياري) ---
    var email = $.trim($("#email").val());
    if (email !== "") {
        var emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            showFieldError("email", "err-email", "صيغة البريد الإلكتروني غير صحيحة.");
            errors.push("البريد الإلكتروني");
            isValid = false;
        } else {
            $("#email").addClass("valid");
        }
    }

    // --- عرض النتيجة ---
    if (!isValid) {
        $("#alert-form-error").text("يرجى تصحيح الأخطاء في الحقول التالية: " + errors.join("، ")).slideDown(300);
        $("html, body").animate({
            scrollTop: $("#order-form").offset().top - 100
        }, 400);
    } else {
        // جمع الوجبات المختارة وعرض النتيجة
        showOrderResult();
    }
}


// ===== عرض خطأ حقل محدد =====
function showFieldError(inputId, errorId, message) {
    $("#" + inputId).addClass("invalid");
    $("#" + errorId).text(message).slideDown(200);
}


// ===== عرض نتيجة الطلب =====
function showOrderResult() {
    var selectedMeals = [];
    var totalPrice = 0;

    $(".chk-select:checked").each(function () {
        var code = $(this).data("code");
        var name = $(this).data("name");
        var price = parseInt($(this).data("price"));
        selectedMeals.push({ code: code, name: name, price: price });
        totalPrice += price;
    });

    // حساب الحسم 5%
    var discount = totalPrice * 0.05;
    var finalPrice = totalPrice - discount;

    // بناء محتوى النتيجة
    var html = "";

    // معلومات الزبون
    var fullName = $.trim($("#fullName").val());
    var nationalId = $.trim($("#nationalId").val());

    html += '<div style="margin-bottom: 20px; padding: 16px; background: #f0f7ff; border-radius: 10px;">';
    if (fullName) {
        html += '<p><strong>الاسم:</strong> ' + escapeHtml(fullName) + '</p>';
    }
    html += '<p><strong>الرقم الوطني:</strong> ' + escapeHtml(nationalId) + '</p>';
    html += '</div>';

    // الوجبات المختارة
    html += '<h3 style="margin-bottom: 12px; color: #1a1a2e;">الوجبات المختارة:</h3>';

    for (var i = 0; i < selectedMeals.length; i++) {
        html += '<div class="result-meal-item">';
        html += '<h4>' + escapeHtml(selectedMeals[i].code) + ' — ' + escapeHtml(selectedMeals[i].name) + '</h4>';
        html += '<p>السعر: ' + formatNumber(selectedMeals[i].price) + ' ل.س</p>';
        html += '</div>';
    }

    // المجموع
    html += '<div class="result-total">';
    html += '<div class="before-discount">المجموع قبل الحسم: ' + formatNumber(totalPrice) + ' ل.س</div>';
    html += '<div class="after-discount">' + formatNumber(finalPrice) + ' ل.س</div>';
    html += '<div class="tax-note">بعد حسم 5% (خصم: ' + formatNumber(discount) + ' ل.س)</div>';
    html += '</div>';

    $("#result-content").html(html);
    $("#result-overlay").css("display", "flex");

    // منع التمرير في الخلفية
    $("body").css("overflow", "hidden");
}


// ===== إغلاق نافذة النتيجة =====
function closeResult() {
    $("#result-overlay").fadeOut(300);
    $("body").css("overflow", "auto");
}

// إغلاق بالضغط خارج النافذة
$(document).on("click", "#result-overlay", function (e) {
    if ($(e.target).is("#result-overlay")) {
        closeResult();
    }
});


// ===== دوال مساعدة =====

// تنسيق الأرقام بفواصل
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// حماية من XSS
function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
