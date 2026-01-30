
var resetFormData = () => {
    $("#s_accountId").val('');
    $("#s_password").val('');
    $("#accountMailid").val('');
    $("#s_rpassword").val('');
    $("#s_mobilenumber").val('');
    $("#s_dob").val('');        
    $("#s_address").val('');

    // $("#signupMsg").hide();
    $("#s_accountId").focus();
}

var doUserSignup = () => {
    var userDetails = {};
    userDetails.accountId = $("#s_accountId").val();
    userDetails.password = $("#s_password").val();
    userDetails.mailId = $("#accountMailid").val();
    userDetails.mobileNumber = $("#s_mobilenumber").val();
    userDetails.dob = $("#s_dob").val();
    userDetails.address = $("#s_address").val();
    userDetails.rpassword = $("#s_rpassword").val();

    // Clear any previous field errors
    const fieldMap = {
        accountId: '#s_accountId',
        password: '#s_password',
        email: '#accountMailid',
        mobile: '#s_mobilenumber',
        address: '#s_address',
        rpassword: '#s_rpassword'
    };

    const clearFieldErrors = () => {
        Object.values(fieldMap).forEach(sel => {
            $(sel).next('.field-error').remove();
            $(sel).removeClass('input-error');
        });
        $("#signupMsg").hide();
        $("#signupMsg span").removeClass("error-message");
    };

    const showFieldError = (selector, msg) => {
        const $el = $(selector);
        $el.addClass('input-error');
        if ($el.next('.field-error').length === 0) {
            $el.after('<span class="field-error" style="color:#d9534f;display:block;margin-top:4px;">' + msg + '</span>');
        } else {
            $el.next('.field-error').text(msg);
        }
    };

    clearFieldErrors();

    // Client-side minimal required check
    if (!userDetails.mailId || !userDetails.password || !userDetails.mobileNumber) {
        $("#signupMsg").show();
        $("#signupMsg span").text("All fields are required: email, password, and mobile.");
        $("#signupMsg span").addClass("error-message");
        return;
    }

    // Client-side mobile validation: exactly 10 digits, no negatives or special chars
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(userDetails.mobileNumber)) {
        showFieldError(fieldMap.mobile, 'Mobile number must be exactly 10 digits and contain only numbers.');
        $(fieldMap.mobile).focus();
        return;
    }

    axios.post('/newUserSignup/register', {
        email: userDetails.mailId,
        password: userDetails.password,
        mobile: userDetails.mobileNumber,
        accountId: userDetails.accountId,
        dob: userDetails.dob,
        address: userDetails.address,
        rpassword: userDetails.rpassword
    }).then((result) => {
        $("#signupMsg").show();
        $("#signupMsg span").removeClass("error-message");
        if (result.data.msg == 'Done') {
            $("#signupMsg span").text("Signed up Successfully");
            resetFormData();
        } else if (result.data && result.data.errors) {
            // show inline errors and focus first
            const errs = result.data.errors || [];
            errs.forEach(e => {
                const sel = fieldMap[e.field] || fieldMap[e.field.toLowerCase()];
                if (sel) showFieldError(sel, e.message);
            });
            const first = result.data.firstError || (errs[0] && errs[0].field);
            const firstSel = fieldMap[first];
            if (firstSel) $(firstSel).focus();
        } else {
            $("#signupMsg span").text(result.data.msg || "Error while doing signup");
            $("#signupMsg span").addClass("error-message");
        }
    }).catch((err) => {
        clearFieldErrors();
        if (err && err.response && err.response.data && err.response.data.errors) {
            const errs = err.response.data.errors;
            errs.forEach(e => {
                const sel = fieldMap[e.field] || fieldMap[e.field.toLowerCase()];
                if (sel) showFieldError(sel, e.message);
            });
            const first = (err.response.data.firstError) || (errs[0] && errs[0].field);
            const firstSel = fieldMap[first];
            if (firstSel) $(firstSel).focus();
            $("#signupMsg").show();
            $("#signupMsg span").text("Please fill the marked fields.");
            $("#signupMsg span").addClass("error-message");
            return;
        }

        $("#signupMsg").show();
        $("#signupMsg span").text("Error while doing signup");
        $("#signupMsg span").addClass("error-message");
    });
}