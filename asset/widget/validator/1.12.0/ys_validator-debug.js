define("widget/validator/1.12.0/ys_validator-debug", [ "./jquery.validate-debug", "./validate-debug.css" ], function(require, exports, module) {
    require("./jquery.validate-debug");
    require("./validate-debug.css");
    jQuery.validator.addMethod("phone", function(value, element) {
        return this.optional(element) || /^(13[0-9]{9}|145[0-9]{8}|147[0-9]{8}|15[0-9]{9}|170[0-9]{8}|18[0-9]{9})$/.test(value);
    }, "请输入有效的手机号");
    jQuery.validator.addMethod("nameRule", function(value, element) {
        return this.optional(element) || !/^_*$|^\d*$/.test(value);
    }, "不能全为下划线或者数字");
    jQuery.validator.addMethod("illegal", function(value, element) {
        return this.optional(element) || !/[\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\%\&\'\"\<\>]/.test(value);
    }, "名称不能包含非法字符");
    jQuery.validator.addMethod("cameraName", function(value, element) {
        return this.optional(element) || !/^.*[\\\\/:\\*\\?\"<>\\|'%]+.*$/.test(value);
    }, "名称不能包含非法字符");
    jQuery.validator.addMethod("address", function(value, element) {
        return this.optional(element) || !/[\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\%\'\"\<\>]/.test(value);
    }, "不能包含非法字符");
    jQuery.validator.addMethod("equalNum", function(value, element, attrs) {
        return this.optional(element) || new RegExp("^.{" + attrs + "}$").test(value);
    }, jQuery.validator.format("手机号长度要为{0}位"));
    jQuery.validator.addMethod("notEq", function(value, element, attrs) {
        return this.optional(element) || value != attrs;
    }, jQuery.validator.format("备注没改变哦"));
    jQuery.validator.addMethod("remote", function(value, element, param) {
        if (this.optional(element)) {
            return "dependency-mismatch";
        }
        var previous = this.previousValue(element), validator, data, self;
        if (!this.settings.messages[element.name]) {
            this.settings.messages[element.name] = {};
        }
        previous.originalMessage = this.settings.messages[element.name].remote;
        this.settings.messages[element.name].remote = previous.message;
        param = typeof param === "string" && {
            url: param
        } || param;
        if (previous.old === value) {
            return previous.valid;
        }
        previous.old = value;
        validator = this;
        this.startRequest(element);
        data = {};
        data[element.name] = value;
        $.ajax(self = $.extend(true, {
            url: param,
            mode: "abort",
            port: "validate" + element.name,
            dataType: "json",
            data: data,
            context: validator.currentForm,
            success: function(response) {
                var valid = response === true || response === "true", errors, message, submitted, msg, rtn;
                msg = response;
                if (typeof self.handler == "function") {
                    rtn = self.handler.call(self, response);
                    valid = rtn === true;
                    valid || (msg = rtn);
                }
                validator.settings.messages[element.name].remote = previous.originalMessage;
                if (valid) {
                    submitted = validator.formSubmitted;
                    validator.prepareElement(element);
                    validator.formSubmitted = submitted;
                    validator.successList.push(element);
                    delete validator.invalid[element.name];
                    validator.showErrors();
                } else {
                    errors = {};
                    message = msg || validator.defaultMessage(element, "remote");
                    errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                    validator.invalid[element.name] = true;
                    validator.showErrors(errors);
                }
                previous.valid = valid;
                validator.stopRequest(element, valid);
            }
        }, param));
        return "pending";
    });
    jQuery.extend(jQuery.validator.messages, {
        required: "不能为空",
        number: "请输入数字",
        minlength: jQuery.validator.format("不能少于{0}个字符"),
        maxlength: jQuery.validator.format("不能超过{0}个字符")
    });
    var _valiMethod = jQuery.validator.prototype.resetForm;
    jQuery.validator.prototype.resetForm = function() {
        $(".tip").show();
        $(".success").remove();
        _valiMethod.call(this);
    };
    jQuery.validator.setDefaults({
        highlight: function(element, errorClass, validClass) {
            $(element).nextAll(".tip:eq(0)").hide();
            setTimeout(function() {
                $(element).next().next(".error").show();
            }, 0);
            $(element).removeClass(validClass).addClass(errorClass);
            $(element).next(".success").remove();
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).nextAll(".tip:eq(0)").show();
            setTimeout(function() {
                $(element).next().next(".error").hide();
            }, 0);
            $(element).removeClass(errorClass).addClass(validClass);
        },
        success: function(label, element) {
            function getStyle(dom, name) {
                if (dom.currentStyle) {
                    return dom.currentStyle[name];
                } else if (window.getComputedStyle) {
                    return window.getComputedStyle(dom, null)[name];
                }
            }
            this.noTip = this.noTip || [];
            var $ele = $(element), pos = $ele.position(), dom = $ele[0], margin_top = Number(/\d+/.exec(getStyle(dom, "marginTop"))), padding_bottom = Number(/\d+/.exec(getStyle(dom, "paddingBottom"))), margin_left = Number(/\d+/.exec(getStyle(dom, "marginLeft")));
            for (var i = 0, l = this.noTip.length; i < l; i++) {
                if ($ele.is("[name=" + this.noTip[i] + "]")) return;
            }
            $.trim($ele.val()).length && ($ele.next(".success").length || $ele.after('<span style="position:absolute;left: ' + (Number(pos.left) + $ele.outerWidth() + margin_left + 4) + "px;top:" + (Number(pos.top) + margin_top + $ele.outerHeight() - 17 - padding_bottom) + 'px" class="success"></span>'));
        }
    });
});