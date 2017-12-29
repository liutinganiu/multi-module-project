/*
 * jQuery validation plug-in 1.7
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.validate.js 6403 2009-06-17 14:27:16Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function ($) {

    $.extend($.fn, {
        // http://docs.jquery.com/Plugins/Validation/validate
        validate: function (options) {

            // if nothing is selected, return nothing; can't chain anyway
            if (!this.length) {
                options && options.debug && window.console && console.warn("nothing selected, can't validate, returning nothing");
                return;
            }

            // check if a validator for this form was already created
            var validator = $.data(this[0], 'validator');
            if (validator) {
                return validator;
            }

            validator = new $.validator(options, this[0]);
            $.data(this[0], 'validator', validator);

            if (validator.settings.onsubmit) {

                // allow suppresing validation by adding a cancel class to the submit button
                this.find("input, button").filter(".cancel").click(function () {
                    validator.cancelSubmit = true;
                });

                // when a submitHandler is used, capture the submitting button
                if (validator.settings.submitHandler) {
                    this.find("input, button").filter(":submit").click(function () {
                        validator.submitButton = this;
                    });
                }

                // validate the form on submit
                this.submit(function (event) {
                    if (validator.settings.debug)
                    // prevent form submit to be able to see console output
                        event.preventDefault();

                    function handle() {
                        if (validator.settings.submitHandler) {
                            if (validator.submitButton) {
                                // insert a hidden input as a replacement for the missing submit button
                                var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
                            }
                            validator.settings.submitHandler.call(validator, validator.currentForm);
                            if (validator.submitButton) {
                                // and clean up afterwards; thanks to no-block-scope, hidden can be referenced
                                hidden.remove();
                            }
                            return false;
                        }
                        return true;
                    }

                    // prevent submit for invalid forms or custom submit handlers
                    if (validator.cancelSubmit) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if (validator.form()) {
                        if (validator.pendingRequest) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }

            return validator;
        },
        // http://docs.jquery.com/Plugins/Validation/valid
        valid: function () {
            if ($(this[0]).is('form')) {
                return this.validate().form();
            } else {
                var valid = true;
                var validator = $(this[0].form).validate();
                this.each(function () {
                    valid &= validator.element(this);
                });
                return valid;
            }
        },
        // attributes: space seperated list of attributes to retrieve and remove
        removeAttrs: function (attributes) {
            var result = {},
                $element = this;
            $.each(attributes.split(/\s/), function (index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        },
        // http://docs.jquery.com/Plugins/Validation/rules
        rules: function (command, argument) {
            var element = this[0];

            if (command) {
                var settings = $.data(element.form, 'validator').settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch (command) {
                    case "add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        staticRules[element.name] = existingRules;
                        if (argument.messages)
                            settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                        break;
                    case "remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        var filtered = {};
                        $.each(argument.split(/\s/), function (index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                        });
                        return filtered;
                }
            }

            var data = $.validator.normalizeRules(
                $.extend(
                    {},
                    $.validator.metadataRules(element),
                    $.validator.classRules(element),
                    $.validator.attributeRules(element),
                    $.validator.staticRules(element)
                ), element);

            // make sure required is at front
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({required: param}, data);
            }

            return data;
        }
    });

// Custom selectors
    $.extend($.expr[":"], {
        // http://docs.jquery.com/Plugins/Validation/blank
        blank: function (a) {
            return !$.trim("" + a.value);
        },
        // http://docs.jquery.com/Plugins/Validation/filled
        filled: function (a) {
            return !!$.trim("" + a.value);
        },
        // http://docs.jquery.com/Plugins/Validation/unchecked
        unchecked: function (a) {
            return !a.checked;
        }
    });

// constructor for validator
    $.validator = function (options, form) {
        this.settings = $.extend(true, {}, $.validator.defaults, options);
        this.currentForm = form;
        this.init();
    };

    $.validator.format = function (source, params) {
        if (arguments.length == 1)
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply(this, args);
            };
        if (arguments.length > 2 && params.constructor != Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor != Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };

    $.extend($.validator, {

        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: [],
            ignoreTitle: false,
            onfocusin: function (element) {
                this.lastActive = element;
                // hide error label and remove error class on focus if enabled
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    this.settings.unhighlight && this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
                    this.errorsFor(element).hide();
                }
            },
            onfocusout: function (element) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element) || $(element).rules())) {
                    this.element(element);
                }
            },
            onkeyup: function (element) {
                if (element.name in this.submitted || element == this.lastElement || $(element).rules()) {
                    this.element(element);
                }
            },
            onclick: function (element) {
                // click on selects, radiobuttons and checkboxes
                if (element.name in this.submitted)
                    this.element(element);
                // or option elements, check parent select in that case
                else if (element.parentNode.name in this.submitted)
                    this.element(element.parentNode);
            },
            highlight: function (element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
            }
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
        setDefaults: function (settings) {
            $.extend($.validator.defaults, settings);
        },

        messages: {
            required: "必填",
            remote: "Please fix this field.",
            email: "email格式有误",
            chinese: "只能输入中文",
            url: "URL格式有误",
            date: "日期格式有误",
            dateISO: "时间格式有误",
            number: "数字格式有误",
            digits: "必须输入整数",
            creditcard: "非法信用卡号",
            equalTo: "两次输入不一致.",
            accept: "Please enter a value with a valid extension.",
            maxlength: $.validator.format("至多 {0} 个字符."),
            minlength: $.validator.format("至少 {0} 个字符."),
            rangelength: $.validator.format("请输入的值的长度在 {0} ~ {1}之间."),
            range: $.validator.format("请输入 {0} ~ {1}之间的值."),
            max: $.validator.format("请输入值不能大于{0}."),

            //TODO 自定义规则
            stringMinLength: $.validator.format("长度不能小于{0}!"),
            stringMaxLength: $.validator.format("长度不能大于{0}!"),
            stringLength: $.validator.format("长度应为{0}!"),
            stringCheck: "只能包括中文字、英文字母、数字和下划线",
            chineseCheck: "只允许中文、数字和下划线",
            englishCheck: "只允许英文、数字和下划线",
            byteRangeLength: "请确保输入的值在3-15个字节之间(一个中文字算2个字节)",
            string: "不允许包含特殊符号!",
            begin: $.validator.format("必须以 {0} 开头!"),
            notEqualTo: $.validator.format("两次输入不能相同!"),
            isMoreThan: $.validator.format("结束时间不能小于开始时间!"),
            isMoreThanDay: $.validator.format("日期间隔超过2天"),
            isSmallThan: $.validator.format("开始时间需要小于!"),
            contDate: $.validator.format("合同结束日期不能小于合同生效日期!"),
            equalTo: $.validator.format("两次输入不相同!"),
            equalToPwd: $.validator.format("两次密码输入不一致!"),
            notEqual: $.validator.format("输入值不允许为{0}!"),
            gt: $.validator.format("输入值必须大于等于{0}!"),
            valipwd: $.validator.format("输入的密码必须为6位数字!"),
            isNub: $.validator.format("输入值必须为数字,长度不大于9位!"),
            isNumber: $.validator.format("输入值必须为数字!"),
            isChinese: $.validator.format("输入值必须为中文!"),
            isLongNum: $.validator.format("输入值必须为整数或小数!"),
            isPNum: $.validator.format("输入值必须为大于0的整数且首位不能为0!"),
            isMoreBeforeAmt: $.validator.format("开始金额不能大于结束金额!"),
            decimal: $.validator.format("小数位数不能超过两位!"),
            alnum: "只能包括英文字母和数字",
            chcharacter: "请输入汉字",
            url: "请输入正确的URL",
            isIdCardNo: "请正确输入您的18位身份证号码",
            isMobile: "请正确输入一个11位的手机号码",
            isTelOrMobile: "请正确填写您的联系方式",
            isEmailOrMobile: "请正确填写您的邮箱或手机号",
            isChinese: "请正确填写，只能输入中文",
            isTel: "请正确填写您的电话号码,格式为：区号-座机号 或 区号-座机号-分机号",
            isUpper: "只能是大写字母、数字和下划线",
            isPhone: "请正确填写您的联系电话,手机号码或固话号码",
            isPhones: "请正确填写您的联系电话,手机号码",
            isFax: "请正确填写您的传真",
            isZipCode: "请正确填写您的邮政编码",
            isImage: "请正确的选择文件类型,格式只能是 'jpg','gif'",
            isEmail: "请正确填写您的邮箱,格式如:enterprise_sh@bestpay.com.cn",
            isEmails: "请正确填写您的邮箱,格式如:enterprise_sh@bestpay.com.cn",
            password: "密码为8-16位字符，至少包含字母大写、字母小写、数字、特殊字符中三种",
            ip: "Ip地址格式错误",
            ips: "Ip地址格式错误",
            toTime: "开始日期不能大于结束日期",
            bankAccount: "银行账户为9-23位数字!格式如:nnnnnnnnn|nnnn nnnn n|nnnn-nnnn-n",
            min: $.validator.format("请输入值不能小于{0}."),
            isRequired: "不能同时为空",
            fileType: $.validator.format("上传文件只支持 {0} !"),
            dbStringMinLength: $.validator.format("长度不能小于{0}!"),
            dbStringMaxLength: $.validator.format("长度不能大于{0}!")
        },

        autoCreateRanges: false,

        prototype: {
            init: function () {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();

                var groups = (this.groups = {});
                $.each(this.settings.groups, function (key, value) {
                    $.each(value.split(/\s/), function (index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function (key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator"),
                        eventType = "on" + event.type.replace(/^validate/, "");
                    validator.settings[eventType] && validator.settings[eventType].call(validator, this[0]);
                }

                $(this.currentForm)
                    .validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
                    .validateDelegate(":radio, :checkbox, select, option", "click", delegate);

                if (this.settings.invalidHandler)
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/form
            form: function () {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid())
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                this.showErrors();
                return this.valid();
            },

            checkForm: function () {
                this.prepareForm();
                for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                    this.check(elements[i]);
                }
                //TODO 加上操作等待的效果
                if (this.valid()) {
                    $.blockUI({
                        css: {
                            border: 'none',
                            padding: '15px',
                            backgroundColor: '#000',
                            '-webkit-border-radius': '10px',
                            '-moz-border-radius': '10px',
                            opacity: .5,
                            color: '#fff'
                        }
                    });
                }
                return this.valid();
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/element
            element: function (element) {
                element = this.clean(element);
                this.lastElement = element;
                this.prepareElement(element);
                this.currentElements = $(element);
                var result = this.check(element);
                if (result) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if (!this.numberOfInvalids()) {
                    // Hide error containers on last error
                    this.toHide = this.toHide.add(this.containers);
                }
                this.showErrors();
                return result;
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/showErrors
            showErrors: function (errors) {
                if (errors) {
                    // add items to error list and map
                    $.extend(this.errorMap, errors);
                    this.errorList = [];
                    for (var name in errors) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    // remove items from success list
                    this.successList = $.grep(this.successList, function (element) {
                        return !(element.name in errors);
                    });
                }
                this.settings.showErrors
                    ? this.settings.showErrors.call(this, this.errorMap, this.errorList)
                    : this.defaultShowErrors();
            },

            // http://docs.jquery.com/Plugins/Validation/Validator/resetForm
            resetForm: function () {
                if ($.fn.resetForm)
                    $(this.currentForm).resetForm();
                this.submitted = {};
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass);
                // add by a_alter
                for (var i = 0; i < this.elements().length; i++) {
                    this.settings.unhighlight.call(this, this.elements()[i], this.settings.errorClass, this.settings.validClass);
                }
            },

            numberOfInvalids: function () {
                return this.objectLength(this.invalid);
            },

            objectLength: function (obj) {
                var count = 0;
                for (var i in obj)
                    count++;
                return count;
            },

            hideErrors: function () {
                if (typeof this.settings.success == "string") {
                    this.addWrapper(this.toHide).hide();
                } else {
                    //modify by a_alter
                    this.settings.success(this.toHide);
                }
            },

            valid: function () {
                return this.size() == 0;
            },

            size: function () {
                return this.errorList.length;
            },

            focusInvalid: function () {
                if (this.settings.focusInvalid) {
                    try {
                        //光标聚集到错误元素
                        var invalidEl = $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible");
                        if (invalidEl.hasClass('Wdate')) {  //My97控件，转换成DOM调用focus事件，以免和jquery事件冲突
                            invalidEl = invalidEl[0].focus();
                        } else {
                            invalidEl.focus().trigger("focusin");
                        }
                        /*$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
                         .filter(":visible")
                         //TODO 这里和my97有冲突
                         .focus()
                         // manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
                         .trigger("focusin");*/
                    } catch (e) {
                        // ignore IE throwing errors when focusing hidden elements
                    }
                }
            },

            findLastActive: function () {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function (n) {
                        return n.element.name == lastActive.name;
                    }).length == 1 && lastActive;
            },

            elements: function () {
                var validator = this,
                    rulesCache = {};

                // select all valid inputs inside the form (no submit or reset buttons)
                // workaround $Query([]).add until http://dev.jquery.com/ticket/2114 is solved
                return $([]).add(this.currentForm.elements)
                    .filter(":input")
                    .not(":submit, :reset, :image, [disabled]")
                    .not(this.settings.ignore)
                    .filter(function () {
                        !this.name && validator.settings.debug && window.console && console.error("%o has no name assigned", this);

                        // select only the first element for each name, and only those with rules specified
                        //TODO 为了多个相同的name都有验证效果
//				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
//					return false;

                        rulesCache[this.name] = true;
                        return true;
                    });
            },

            clean: function (selector) {
                return $(selector)[0];
            },

            errors: function () {
                return $(this.settings.errorElement + "." + this.settings.errorClass, this.errorContext);
            },

            reset: function () {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.currentElements = $([]);
            },

            prepareForm: function () {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            },

            prepareElement: function (element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },

            check: function (element) {
                element = this.clean(element);

                // if radio/checkbox, validate first element in group instead
                if (this.checkable(element)) {
                    element = this.findByName(element.name)[0];
                }

                var rules = $(element).rules();
                var dependencyMismatch = false;
                for (method in rules) {
                    var rule = {method: method, parameters: rules[method]};
                    try {
                        var result = $.validator.methods[method].call(this, element.value.replace(/\r/g, ""), element, rule.parameters);

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if (result == "dependency-mismatch") {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if (result == "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }

                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
                            + ", check the '" + rule.method + "' method", e);
                        throw e;
                    }
                }
                if (dependencyMismatch)
                    return;
                if (this.objectLength(rules))
                    this.successList.push(element);
                return true;
            },

            // return the custom message for the given element and validation method
            // specified in the element's "messages" metadata
            customMetaMessage: function (element, method) {
                if (!$.metadata)
                    return;

                var meta = this.settings.meta
                    ? $(element).metadata()[this.settings.meta]
                    : $(element).metadata();

                return meta && meta.messages && meta.messages[method];
            },

            // return the custom message for the given element name and validation method
            customMessage: function (name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor == String
                        ? m
                        : m[method]);
            },

            // return the first defined argument, allowing empty strings
            findDefined: function () {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined)
                        return arguments[i];
                }
                return undefined;
            },

            defaultMessage: function (element, method) {
                return this.findDefined(
                    this.customMessage(element.name, method),
                    this.customMetaMessage(element, method),
                    // title is never undefined, so handle empty string as undefined
                    !this.settings.ignoreTitle && element.title || undefined,
                    $.validator.messages[method],
                    "<strong>Warning: No message defined for " + element.name + "</strong>"
                );
            },

            formatAndAdd: function (element, rule) {
                var message = this.defaultMessage(element, rule.method),
                    theregex = /\$?\{(\d+)\}/g;
                if (typeof message == "function") {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
                }
                this.errorList.push({
                    message: message,
                    element: element
                });

                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },

            addWrapper: function (toToggle) {
                if (this.settings.wrapper)
                    toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
                return toToggle;
            },

            defaultShowErrors: function () {
                for (var i = 0; this.errorList[i]; i++) {
                    var error = this.errorList[i];
                    this.settings.highlight && this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    for (var i = 0; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    for (var i = 0, elements = this.validElements(); elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            },
            // 不再无效里面即位无效
            validElements: function () {
                return this.currentElements.not(this.invalidElements());
            },
            // 无效的元素 cong errorList中获取
            invalidElements: function () {
                return $(this.errorList).map(function () {
                    return this.element;
                });
            },

            showLabel: function (element, message) {
                var label = this.errorsFor(element);
                if (label.length) {
                    // refresh error/success class
                    label.removeClass().addClass(this.settings.errorClass);

                    // check if we have a generated label, replace the message then
                    label.attr("generated") && label.html(message);
                } else {
                    // create label
                    label = $("<" + this.settings.errorElement + "/>")
                        .attr({"for": this.idOrName(element), generated: true})
                        .addClass(this.settings.errorClass)
                        .html(message || "");
                    if (this.settings.wrapper) {
                        // make sure the element is visible, even in IE
                        // actually showing the wrapped element is handled elsewhere
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (!this.labelContainer.append(label).length)
                        this.settings.errorPlacement
                            ? this.settings.errorPlacement(label, $(element))
                            : label.insertAfter(element);
                }
                if (!message && this.settings.success) {
                    label.text("");
                    typeof this.settings.success == "string"
                        ? label.addClass(this.settings.success)
                        : this.settings.success(label);
                }
                this.toShow = this.toShow.add(label);
            },

            errorsFor: function (element) {
                var name = this.idOrName(element);
                return this.errors().filter(function () {
                    return $(this).attr('for') == name;
                });
            },

            idOrName: function (element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },

            checkable: function (element) {
                return /radio|checkbox/i.test(element.type);
            },

            findByName: function (name) {
                // select by name and filter by form for performance over form.find("[name=...]")
                var form = this.currentForm;
                return $(document.getElementsByName(name)).map(function (index, element) {
                    return element.form == form && element.name == name && element || null;
                });
            },

            getLength: function (value, element) {
                switch (element.nodeName.toLowerCase()) {
                    case 'select':
                        return $("option:selected", element).length;
                    case 'input':
                        if (this.checkable(element))
                            return this.findByName(element.name).filter(':checked').length;
                }
                return value.length;
            },

            depend: function (param, element) {
                return this.dependTypes[typeof param]
                    ? this.dependTypes[typeof param](param, element)
                    : true;
            },

            dependTypes: {
                "boolean": function (param, element) {
                    return param;
                },
                // 非0 即为 true
                "string": function (param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function (param, element) {
                    return param(element);
                }
            },
            //
            optional: function (element) {
                return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
            },

            startRequest: function (element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },

            stopRequest: function (element, valid) {
                this.pendingRequest--;
                // sometimes synchronization fails, make sure pendingRequest is never < 0
                if (this.pendingRequest < 0)
                    this.pendingRequest = 0;
                delete this.pending[element.name];
                if (valid && this.pendingRequest == 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                    this.formSubmitted = false;
                } else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false;
                }
            },

            previousValue: function (element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", {
                        old: null,
                        valid: true,
                        message: this.defaultMessage(element, "remote")
                    });
            }

        },

        classRuleSettings: {
            required: {required: true},
            email: {email: true},
            isChinese: {isChinese: true},
//		isMobile : {isMobile:true},
            url: {url: true},
            date: {date: true},
            dateISO: {dateISO: true},
            dateDE: {dateDE: true},
            number: {number: true},
            numberDE: {numberDE: true},
            digits: {digits: true},
            //TODO
            stringMinLength: {stringMinLength: true},
            stringMaxLength: {stringMaxLength: true},
            stringLength: {stringLength: true},
            stringCheck: {stringCheck: true},
            chineseCheck: {chineseCheck: true},
            englishCheck: {englishCheck: true},
            byteRangeLength: {byteRangeLength: true},
            string: {string: true},
            begin: {begin: true},
            notEqualTo: {notEqualTo: true},
            isMoreThan: {isMoreThan: true},
            isMoreThanDay: {isMoreThanDay: true},
            isSmallThan: {isMoreThan: true},
            contDate: {contDate: true},
            equalTo: {equalTo: true},
            equalToPwd: {equalToPwd: true},
            notEqual: {notEqual: true},
            gt: {gt: true},
            valipwd: {valipwd: true},
            isNub: {isNub: true},
            isNumber: {isNumber: true},
            isLongNum: {isLongNum: true},
            isPNum: {isPNum: true},
            isMoreBeforeAmt: {isMoreBeforeAmt: true},
            decimal: {decimal: true},
            alnum: {alnum: true},
            chcharacter: {chcharacter: true},
            url: {url: true},
            isIdCardNo: {isIdCardNo: true},
            isMobile: {isMobile: true},
            isTelOrMobile: {isTelOrMobile: true},
            isEmailOrMobile: {isEmailOrMobile: true},
            isTel: {isTel: true},
            isUpper: {isUpper: true},
            isPhone: {isPhone: true},
            isPhones: {isPhones: true},
            isFax: {isFax: true},
            isZipCode: {isZipCode: true},
            isImage: {isImage: true},
            isEmail: {isEmail: true},
            isEmails: {isEmails: true},
            password: {password: true},
            ip: {ip: true},
            ips: {ips: true},
            toTime: {toTime: true},
            bankAccount: {bankAccount: true},
            creditcard: {creditcard: true},
            dbStringMinLength: {dbStringMinLength: true},
            dbStringMaxLength: {dbStringMaxLength: true},

            //TODO
            isRequired: {isRequired: true}
        },

        addClassRules: function (className, rules) {
            className.constructor == String ?
                this.classRuleSettings[className] = rules :
                $.extend(this.classRuleSettings, className);
        },

        classRules: function (element) {
            var rules = {};
            var classes = $(element).attr('class');
            classes && $.each(classes.split(' '), function () {
                if (this in $.validator.classRuleSettings) {
                    $.extend(rules, $.validator.classRuleSettings[this]);
                }
            });
            return rules;
        },

        attributeRules: function (element) {
            var rules = {};
            var $element = $(element);

            for (method in $.validator.methods) {
                var value = $element.attr(method);
                if (value) {
                    rules[method] = value;
                }
            }

            // maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }

            return rules;
        },

        metadataRules: function (element) {
            if (!$.metadata) return {};

            var meta = $.data(element.form, 'validator').settings.meta;
            return meta ?
                $(element).metadata()[meta] :
                $(element).metadata();
        },

        staticRules: function (element) {
            var rules = {};
            var validator = $.data(element.form, 'validator');
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },

        normalizeRules: function (rules, element) {
            // handle dependency check
            $.each(rules, function (prop, val) {
                // ignore rule when param is explicitly false, eg. required:false
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case "string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });

            // evaluate parameters
            $.each(rules, function (rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });

            // clean number parameters
            $.each(['minlength', 'maxlength', 'min', 'max'], function () {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength', 'range'], function () {
                if (rules[this]) {
                    rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                }
            });

            if ($.validator.autoCreateRanges) {
                // auto-create ranges
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }

            // To support custom messages in metadata ignore rule methods titled "messages"
            if (rules.messages) {
                delete rules.messages;
            }

            return rules;
        },

        // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
        normalizeRule: function (data) {
            if (typeof data == "string") {
                var transformed = {};
                $.each(data.split(/\s/), function () {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/addMethod
        addMethod: function (name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },

        methods: {

            // http://docs.jquery.com/Plugins/Validation/Methods/required
            required: function (value, element, param) {
                // check if dependency is met
                if (!this.depend(param, element))
                    return "dependency-mismatch";
                switch (element.nodeName.toLowerCase()) {
                    case 'select':
                        // could be an array for select-multiple or a string, both are fine this way
                        var val = $(element).val();
                        return val && val.length > 0;
                    case 'input':
                        if (this.checkable(element))
                            return this.getLength(value, element) > 0;
                    default:
                        return $.trim(value).length > 0;
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/remote
            remote: function (value, element, param) {
                if (this.optional(element))
                    return "dependency-mismatch";

                var previous = this.previousValue(element);
                if (!this.settings.messages[element.name])
                    this.settings.messages[element.name] = {};
                previous.originalMessage = this.settings.messages[element.name].remote;
                this.settings.messages[element.name].remote = previous.message;

                param = typeof param == "string" && {url: param} || param;

                if (previous.old !== value) {
                    previous.old = value;
                    var validator = this;
                    this.startRequest(element);
                    var data = {};
                    data[element.name] = value;
                    $.ajax($.extend(true, {
                        url: param,
                        mode: "abort",
                        port: "validate" + element.name,
                        dataType: "json",
                        data: data,
                        success: function (response) {
                            validator.settings.messages[element.name].remote = previous.originalMessage;
                            var valid = response === true;
                            if (valid) {
                                var submitted = validator.formSubmitted;
                                validator.prepareElement(element);
                                validator.formSubmitted = submitted;
                                validator.successList.push(element);
                                validator.showErrors();
                            } else {
                                var errors = {};
                                var message = (previous.message = response || validator.defaultMessage(element, "remote"));
                                errors[element.name] = $.isFunction(message) ? message(value) : message;
                                validator.showErrors(errors);
                            }
                            previous.valid = valid;
                            validator.stopRequest(element, valid);
                        }
                    }, param));
                    return "pending";
                } else if (this.pending[element.name]) {
                    return "pending";
                }
                return previous.valid;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/minlength
            minlength: function (value, element, param) {
                return this.optional(element) || this.getLength($.trim(value), element) >= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/maxlength
            maxlength: function (value, element, param) {
                return this.optional(element) || this.getLength($.trim(value), element) <= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/rangelength
            rangelength: function (value, element, param) {
                var length = this.getLength($.trim(value), element);
                return this.optional(element) || ( length >= param[0] && length <= param[1] );
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/min
            min: function (value, element, param) {
                return this.optional(element) || value >= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/max
            max: function (value, element, param) {
                return this.optional(element) || value <= param;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/range
            range: function (value, element, param) {
                return this.optional(element) || ( value >= param[0] && value <= param[1] );
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/email
            email: function (value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
            },
            isChinese: function (value, element) {
                var reg = /^[\u4E00-\u9FA5]+$/;
                return this.optional(element) || (reg.test(value));
            },
//		isMobile: function(value, element) {
//			var length = value.length;   
//			var mobile = /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/;   
//			return this.optional(element) || (length == 11 && mobile.test(value));
//		},

            // http://docs.jquery.com/Plugins/Validation/Methods/url
            url: function (value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/date
            date: function (value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
            dateISO: function (value, element) {
                //return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
                return this.optional(element) || /^\d{4}\d{1,2}\d{1,2}$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/number
            number: function (value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/digits
            digits: function (value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
            // based on http://en.wikipedia.org/wiki/Luhn
            creditcard: function (value, element) {
                if (this.optional(element))
                    return "dependency-mismatch";
                // accept only digits and dashes
                if (/[^0-9-]+/.test(value))
                    return false;
                var nCheck = 0,
                    nDigit = 0,
                    bEven = false;

                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    var nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9)
                            nDigit -= 9;
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) == 0;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/accept
            accept: function (value, element, param) {
                param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
                return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
            },

            //-----------------------------
            //TODO 自定义规则
            stringMinLength: function (value, element, param) {
                var length = value.length;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127) {
                        length++;
                    }
                }
                return this.optional(element) || (length >= param);
            },
            stringMaxLength: function (value, element, param) {
                var length = value.length;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127) {
                        length++;
                    }
                }
                return this.optional(element) || (length <= param);
            },
            stringLength: function (value, element, param) {
                var length = value.length;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127) {
                        length++;
                    }
                }
                return this.optional(element) || (length == param);
            },
            stringCheck: function (value, element) {
                return this.optional(element) || /^[\u0391-\uFFE5\w]+$/.test(value);
            },
            chineseCheck: function (value, element) {
                return this.optional(element) || /^[0-9_\u4e00-\u9fa5]+$/.test(value);
            },
            englishCheck: function (value, element) {
                return this.optional(element) || /^[0-9_a-zA-Z]+$/.test(value);
            },
            byteRangeLength: function (value, element, param) {
                var length = value.length;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127) {
                        length++;
                    }
                }
                return this.optional(element) || ( length >= param[0] && length <= param[1] );
            },
            string: function (value, element) {
                return this.optional(element) || /^[\u0391-\uFFE5\w]+$/.test(value);
            },
            begin: function (value, element, param) {
                var begin = new RegExp("^" + param);
                return this.optional(element) || (begin.test(value));
            },
            fileType: function (value, element, param) {
                if (!param || !value) {
                    return true;
                }
                var str = param.split(",");
                var fileType = value.substr(value.lastIndexOf(".")+1, value.length).toUpperCase();
                for (var i = 0; i < str.length; i++) {
                    if (str[i].toUpperCase() == fileType) {
                        return true;
                    }
                }
                return false;
            },
            notEqualTo: function (value, element, param) {
                return value != $(param).val();
            },
            isMoreThan: function (value, element, param) {
                var paramValue = $(param).val();
                paramValue = (paramValue == '') ? '0' : paramValue;
                value = (value == '') ? '99999999' : value;
                return parseInt(value) >= parseInt(paramValue);
            },
            isMoreThanDay: function (value, element, param) {
                var paramValue = $(param).val();
                paramValue = (paramValue == '') ? '0' : paramValue;
                value = (value == '') ? '99999999' : value;
                return parseInt(value) - parseInt(paramValue) <= 1;
            },
            isSmallThan: function (value, element, param) {
                var paramValue = $(param).val();
                if ("" == paramValue || undefined == paramValue) {
                    //$.validator.messages.isSmallThan = "请选择商户";
                    return true;
                }
                paramValue = (paramValue == '') ? '0' : paramValue;
                value = (value == '') ? '99999999' : value;
                if (0 == parseInt(paramValue) || undefined == parseInt(paramValue)) {
                    //$.validator.messages.isSmallThan = "请选择商户";
                    return true;
                } else
                    $.validator.messages.isSmallThan = "开始时间需要小于时间" + paramValue;
                return parseInt(value) <= parseInt(paramValue);
            },
            contDate: function (value, element, param) {
                var paramValue = $(param).val();
                paramValue = (paramValue == '') ? '0' : paramValue;
                value = (value == '') ? '99999999' : value;
                return parseInt(value) >= parseInt(paramValue);
            },
            equalTo: function (value, element, param) {
                return value == $(param).val();
            },
            equalToPwd: function (value, element, param) {
                return value == $(param).val();
            },
            notEqual: function (value, element, param) {
                return value != param;
            },
            gt: function (value, element, param) {
                return value >= param;
            },
            valipwd: function (value, element) {
                var tel = /^[0-9]{6}$/;
                return this.optional(element) || (tel.test(value));
            },
            isNub: function (value, element) {
                var tel = /^[0-9]{1,9}$/;
                return this.optional(element) || (tel.test(value));
            },
            isNumber: function (value, element) {
                var tel = /^(-?\d+)$/;
                return this.optional(element) || (tel.test(value));
            },
            isChinese: function (value, element) {
                var reg = /^[\u4E00-\u9FA5]+$/;
                return this.optional(element) || (reg.test(value));
            },
            isLongNum: function (value, element) {
                var tel = /^(-?\d+)(\.\d+)?$/;
                return this.optional(element) || (tel.test(value));
            },
            isPNum: function (value, element) {
                var tel = /^[1-9]\d*$/;
                return this.optional(element) || (tel.test(value));
            },
            isMoreBeforeAmt: function (value, element, param) {
                var paramValue = $(param).val();
                paramValue = (paramValue == '') ? '0' : paramValue;
                value = (value == '') ? '99999999' : value;
                return parseFloat(value) >= parseFloat(paramValue);
            },
            decimal: function (value, element) {
                var decimal = /^-?\d+(\.\d{1,2})?$/;
                return this.optional(element) || (decimal.test(value));
            },
            alnum: function (value, element) {
                return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);
            },
            chcharacter: function (value, element) {
                var tel = /^[\u4e00-\u9fa5]+$/;
                return this.optional(element) || (tel.test(value));
            },
            url: function (value, element) {
                var tel = /(^((https|http|ftp|rtsp|mms):\/\/)?[a-z0-9A-Z]{3}\.[a-z0-9A-Z][a-z0-9A-Z]{0,61}?[a-z0-9A-Z]\.com|net|cn|cc (:s[0-9]{1-4})?\/$)(:?)+/;
                return this.optional(element) || (tel.test(value));
            },
            isIdCardNo: function (value, element) {
                /**
                 * 15位身份证
                 * /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/.test(value)||
                 */
                return this.optional(element) || /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[A-Z])$/.test(value);
            },
            isMobile: function (value, element) {
                var length = value.length;
                /*var mobile =/^(1[3|4|5|8][0-9]+\d{11})$/;*/
                var mobile = /^(1[0-9][0-9]+\d{8})$/;
                return this.optional(element) || (length == 11 && mobile.test(value));
            },
            isTel: function (value, element) {
                //电话号码如:3-4位区号，7-8位直播号码，1－4位分机号
                var tel = /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
                return this.optional(element) || (tel.test(value));
            },
            isTelOrMobile: function (value, element) {
                var length = value.length;
                /*var mobile =/^(1[3|4|5|8][0-9]+\d{8})$/;*/
                var mobile = /^(1[0-9][0-9]+\d{8})$/;
                var mobileFlag = this.optional(element) || (length == 11 && mobile.test(value));
                //电话号码如:3-4位区号，7-8位直播号码，1－4位分机号
                var tel = /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
                var telFlag = this.optional(element) || (tel.test(value));
                return (mobileFlag || telFlag);
            },
            isEmailOrMobile: function (value, element) {
                var length = value.length;
                var mobile = /^(1[3|4|5|8][0-9]+\d{8})$/;
                var mobileFlag = this.optional(element) || (length == 11 && mobile.test(value));
                //电话号码如:3-4位区号，7-8位直播号码，1－4位分机号
                var email = /(^\w+[-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var emailFlag = this.optional(element) || (email.test(value));
                return (mobileFlag || emailFlag);
            },
            isUpper: function (value, element) {
                var tel = /^[A-Z0-9_]+$/;
                return this.optional(element) || (tel.test(value));
            },
            isPhone: function (value, element) {
                var mobile = /^(1[3|4|5|8][0-9]+\d{8})$/;
                var tel = /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
                return this.optional(element) || (tel.test(value) || mobile.test(value));
            },
            isPhones: function (value, element) {
                var mobile = /^(1[3|4|5|8][0-9]+\d{8})$/;
                var flag = true;
                if (value.indexOf(";") != -1) {
                    var values = $.trim(value).split(";");
                    for (var i = 0; i < values.length; i++) {
                        var length = values[i].length;
                        if (!mobile.test($.trim(values[i])) || length != 11) {
                            flag = false;
                            break;
                        }
                    }
                } else {
                    var length = value.length;
                    flag = mobile.test(value) && (length == 11);
                }
                return this.optional(element) || (flag);
            },
            isFax: function (value, element) {
                var mobile = /^(1[3|4|5|8][0-9]+\d{8})$/;
                var tel = /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
                return this.optional(element) || (tel.test(value) || mobile.test(value));
            },
            isZipCode: function (value, element) {
                var tel = /^[0-9]{6}$/;
                return this.optional(element) || (tel.test(value));
            },
            isImage: function (value, element) {
                var result = false;
                if (value == "") {
                    result = true;
                } else {
                    value = value.substring(value.lastIndexOf(".")).toLowerCase();
                    //如果需要增加文件类型 ，就在这里 增加
                    var fileType = new Array(".jpg", ".gif");
                    for (var i = 0; i < fileType.length; i++) {
                        if (value == fileType[i]) {
                            result = true;
                            break;
                        }
                    }
                }
                return result;
            },
            isEmail: function (value, element) {
                var email = /(^\w+[-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                return this.optional(element) || (email.test(value));
            },
            isEmails: function (value, element) {
                var email = /(^\w+[-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                var flag = true;
                if (value.indexOf(";") != -1) {
                    var values = $.trim(value).split(";");
                    for (var i = 0; i < values.length; i++) {
                        if (!email.test($.trim(values[i]))) {
                            flag = false;
                            break;
                        }
                    }
                } else {
                    flag = email.test(value);
                }
                return this.optional(element) || (flag);
            },
            password: function (value, element) {
                var length = value.length;
                //var upwd = /^(?![a-zA-Z]+$|[0-9]+$)[a-zA-Z0-9`=\\;',.\/~!@#$%^&*()_+|{}:\"<>+]{8,16}$/;
                var upwd = /^(([-\da-zA-Z`=\\\[\];',.\/~!@#$%^&*()_+|{}:\"<>+?]*((\d+[a-zA-Z]+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+)|(\d+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+[a-zA-Z]+)|([a-zA-Z]+\d+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+)|([a-zA-Z]+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+\d+)|([-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+\d+[a-zA-Z]+)|([-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+[a-zA-Z]+\d+))[-\da-zA-Z`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]*)|([-\da-zA-Z]*((\d+[a-z]+[A-Z]+)|(\d+[A-Z]+[a-z]+)|([A-Z]+\d+[a-z]+)|([A-Z]+[a-z]+\d+)|([a-z]+\d+[A-Z]+)|([a-z]+[A-Z]+\d+))[-\da-zA-Z]*)|([-a-zA-Z`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]*(([a-z]+[A-Z]+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+)|([a-z]+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+[A-Z]+)|([A-Z]+[a-z]+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+)|([A-Z]+[-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+[a-z]+)|([-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+[a-z]+[A-Z]+)|([-`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]+[A-Z]+[a-z]+))[-\da-zA-Z`=\\\[\];',.\/~!@#$%^&*()_+|{}:"<>?]*))$/;
                return this.optional(element) || (length <= 16 && length >= 8 && upwd.test(value));
            },
            ip: function (value, element) {
                var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                return this.optional(element) || (ip.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256));
            },
            ips: function (value, element) {
                var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                var flag = true;
                if (value.indexOf(";") != -1) {
                    var values = $.trim(value).split(";");
                    for (var i = 0; i < values.length; i++) {
                        if (!ip.test($.trim(values[i]))) {
                            flag = false;
                            break;
                        }
                    }
                } else {
                    flag = ip.test(value);
                }
                return this.optional(element) || (flag && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256));
            },
            toTime: function (value, element) {
                var forTime = $(".forTime");
                var flag = getDateRegion(forTime.val(), value) >= 0 ? true : false;
                return this.optional(element) || flag;
            },
            bankAccount: function (value, element) {
                //var bankAccount=/^\d{9,23}$|^(\d{4}[\s\-]?){4,5}\d{1,3}$|^\d{4}[- ]\d{4}[- ]\d{4}[- ]\d{4}$/;
                var bankAccount = /^\d{9,23}$|^(\d{4}[\s\-]?){2,5}\d{1,3}$|^\d{4}[- ]\d{4}[- ]\d{4}[- ]\d{4}$/;
                return this.optional(element) || (bankAccount.test(value));
            },
            dbStringMinLength: function (value, element, param) {
                var length = value.length;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127) {
                        length+=2;
                    }
                }
                return this.optional(element) || (length >= param);
            },
            dbStringMaxLength: function (value, element, param) {
                var length = value.length;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127) {
                        length+=2;
                    }
                }
                return this.optional(element) || (length <= param);
            },
            //-----------------------------
            //TODO 20141201新增
            isRequired: function (value, element, param) {
                var $element = $(element);
                var zuheID = $element.attr("data-id");
                if (!zuheID) {
                    return false;
                }
                var ids = zuheID.split(",");

                var texts = $element.val();
                if (!texts) {
                    for (var i = 0; i < ids.length; i++) {
                        var $val = $("#" + ids[i]).val();
                        if ($val) {
                            texts += $val;
                            break;
                        }
                    }
                }
                if (texts) {
                    for (var i = 0; i < ids.length; i++) {
                        if ($element.attr("id") != ids[i]) {
                            $("#" + ids[i]).parent().children("div[class='formError']").remove();
                        }
                    }
                }
                return texts ? true : false;
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
            equalTo: function (value, element, param) {
                // bind to the blur event of the target in order to revalidate whenever the target field is updated
                // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
                var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function () {
                    $(element).valid();
                });
                return value == target.val();
            }

        }
    });

// deprecated, use $.validator.format instead
    $.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort() 
;
(function ($) {
    var ajax = $.ajax;
    var pendingRequests = {};
    $.ajax = function (settings) {
        // create settings for compatibility with ajaxSetup
        settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
        var port = settings.port;
        if (settings.mode == "abort") {
            if (pendingRequests[port]) {
                pendingRequests[port].abort();
            }
            return (pendingRequests[port] = ajax.apply(this, arguments));
        }
        return ajax.apply(this, arguments);
    };
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target 
;
(function ($) {
    // only implement if not provided by jQuery core (since 1.4)
    // TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
    if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
        $.each({
            focus: 'focusin',
            blur: 'focusout'
        }, function (original, fix) {
            $.event.special[fix] = {
                setup: function () {
                    this.addEventListener(original, handler, true);
                },
                teardown: function () {
                    this.removeEventListener(original, handler, true);
                },
                handler: function (e) {
                    arguments[0] = $.event.fix(e);
                    arguments[0].type = fix;
                    return $.event.handle.apply(this, arguments);
                }
            };
            function handler(e) {
                e = $.event.fix(e);
                e.type = fix;
                return $.event.handle.call(this, e);
            }
        });
    }
    ;
    $.extend($.fn, {
        validateDelegate: function (delegate, type, handler) {
            return this.bind(type, function (event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        }
    });
})(jQuery);
