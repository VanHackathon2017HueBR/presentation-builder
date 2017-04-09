/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var sharedUtil = require('../shared/util.js');
var displayDOMUtils = require('./dom_utils.js');
var AnnotationBorderStyleType = sharedUtil.AnnotationBorderStyleType;
var AnnotationType = sharedUtil.AnnotationType;
var stringToPDFString = sharedUtil.stringToPDFString;
var Util = sharedUtil.Util;
var addLinkAttributes = displayDOMUtils.addLinkAttributes;
var LinkTarget = displayDOMUtils.LinkTarget;
var getFilenameFromUrl = displayDOMUtils.getFilenameFromUrl;
var warn = sharedUtil.warn;
var CustomStyle = displayDOMUtils.CustomStyle;
var getDefaultSetting = displayDOMUtils.getDefaultSetting;
function AnnotationElementFactory() {}
AnnotationElementFactory.prototype = {
  create: function AnnotationElementFactory_create(parameters) {
    var subtype = parameters.data.annotationType;
    switch (subtype) {
      case AnnotationType.LINK:
        return new LinkAnnotationElement(parameters);
      case AnnotationType.TEXT:
        return new TextAnnotationElement(parameters);
      case AnnotationType.WIDGET:
        var fieldType = parameters.data.fieldType;
        switch (fieldType) {
          case 'Tx':
            return new TextWidgetAnnotationElement(parameters);
          case 'Btn':
            if (parameters.data.radioButton) {
              return new RadioButtonWidgetAnnotationElement(parameters);
            } else if (parameters.data.checkBox) {
              return new CheckboxWidgetAnnotationElement(parameters);
            }
            warn('Unimplemented button widget annotation: pushbutton');
            break;
          case 'Ch':
            return new ChoiceWidgetAnnotationElement(parameters);
        }
        return new WidgetAnnotationElement(parameters);
      case AnnotationType.POPUP:
        return new PopupAnnotationElement(parameters);
      case AnnotationType.HIGHLIGHT:
        return new HighlightAnnotationElement(parameters);
      case AnnotationType.UNDERLINE:
        return new UnderlineAnnotationElement(parameters);
      case AnnotationType.SQUIGGLY:
        return new SquigglyAnnotationElement(parameters);
      case AnnotationType.STRIKEOUT:
        return new StrikeOutAnnotationElement(parameters);
      case AnnotationType.FILEATTACHMENT:
        return new FileAttachmentAnnotationElement(parameters);
      default:
        return new AnnotationElement(parameters);
    }
  }
};
var AnnotationElement = function AnnotationElementClosure() {
  function AnnotationElement(parameters, isRenderable) {
    this.isRenderable = isRenderable || false;
    this.data = parameters.data;
    this.layer = parameters.layer;
    this.page = parameters.page;
    this.viewport = parameters.viewport;
    this.linkService = parameters.linkService;
    this.downloadManager = parameters.downloadManager;
    this.imageResourcesPath = parameters.imageResourcesPath;
    this.renderInteractiveForms = parameters.renderInteractiveForms;
    if (isRenderable) {
      this.container = this._createContainer();
    }
  }
  AnnotationElement.prototype = {
    _createContainer: function AnnotationElement_createContainer() {
      var data = this.data,
          page = this.page,
          viewport = this.viewport;
      var container = document.createElement('section');
      var width = data.rect[2] - data.rect[0];
      var height = data.rect[3] - data.rect[1];
      container.setAttribute('data-annotation-id', data.id);
      var rect = Util.normalizeRect([data.rect[0], page.view[3] - data.rect[1] + page.view[1], data.rect[2], page.view[3] - data.rect[3] + page.view[1]]);
      CustomStyle.setProp('transform', container, 'matrix(' + viewport.transform.join(',') + ')');
      CustomStyle.setProp('transformOrigin', container, -rect[0] + 'px ' + -rect[1] + 'px');
      if (data.borderStyle.width > 0) {
        container.style.borderWidth = data.borderStyle.width + 'px';
        if (data.borderStyle.style !== AnnotationBorderStyleType.UNDERLINE) {
          width = width - 2 * data.borderStyle.width;
          height = height - 2 * data.borderStyle.width;
        }
        var horizontalRadius = data.borderStyle.horizontalCornerRadius;
        var verticalRadius = data.borderStyle.verticalCornerRadius;
        if (horizontalRadius > 0 || verticalRadius > 0) {
          var radius = horizontalRadius + 'px / ' + verticalRadius + 'px';
          CustomStyle.setProp('borderRadius', container, radius);
        }
        switch (data.borderStyle.style) {
          case AnnotationBorderStyleType.SOLID:
            container.style.borderStyle = 'solid';
            break;
          case AnnotationBorderStyleType.DASHED:
            container.style.borderStyle = 'dashed';
            break;
          case AnnotationBorderStyleType.BEVELED:
            warn('Unimplemented border style: beveled');
            break;
          case AnnotationBorderStyleType.INSET:
            warn('Unimplemented border style: inset');
            break;
          case AnnotationBorderStyleType.UNDERLINE:
            container.style.borderBottomStyle = 'solid';
            break;
          default:
            break;
        }
        if (data.color) {
          container.style.borderColor = Util.makeCssRgb(data.color[0] | 0, data.color[1] | 0, data.color[2] | 0);
        } else {
          container.style.borderWidth = 0;
        }
      }
      container.style.left = rect[0] + 'px';
      container.style.top = rect[1] + 'px';
      container.style.width = width + 'px';
      container.style.height = height + 'px';
      return container;
    },
    _createPopup: function AnnotationElement_createPopup(container, trigger, data) {
      if (!trigger) {
        trigger = document.createElement('div');
        trigger.style.height = container.style.height;
        trigger.style.width = container.style.width;
        container.appendChild(trigger);
      }
      var popupElement = new PopupElement({
        container: container,
        trigger: trigger,
        color: data.color,
        title: data.title,
        contents: data.contents,
        hideWrapper: true
      });
      var popup = popupElement.render();
      popup.style.left = container.style.width;
      container.appendChild(popup);
    },
    render: function AnnotationElement_render() {
      throw new Error('Abstract method AnnotationElement.render called');
    }
  };
  return AnnotationElement;
}();
var LinkAnnotationElement = function LinkAnnotationElementClosure() {
  function LinkAnnotationElement(parameters) {
    AnnotationElement.call(this, parameters, true);
  }
  Util.inherit(LinkAnnotationElement, AnnotationElement, {
    render: function LinkAnnotationElement_render() {
      this.container.className = 'linkAnnotation';
      var link = document.createElement('a');
      addLinkAttributes(link, {
        url: this.data.url,
        target: this.data.newWindow ? LinkTarget.BLANK : undefined
      });
      if (!this.data.url) {
        if (this.data.action) {
          this._bindNamedAction(link, this.data.action);
        } else {
          this._bindLink(link, this.data.dest);
        }
      }
      this.container.appendChild(link);
      return this.container;
    },
    _bindLink: function LinkAnnotationElement_bindLink(link, destination) {
      var self = this;
      link.href = this.linkService.getDestinationHash(destination);
      link.onclick = function () {
        if (destination) {
          self.linkService.navigateTo(destination);
        }
        return false;
      };
      if (destination) {
        link.className = 'internalLink';
      }
    },
    _bindNamedAction: function LinkAnnotationElement_bindNamedAction(link, action) {
      var self = this;
      link.href = this.linkService.getAnchorUrl('');
      link.onclick = function () {
        self.linkService.executeNamedAction(action);
        return false;
      };
      link.className = 'internalLink';
    }
  });
  return LinkAnnotationElement;
}();
var TextAnnotationElement = function TextAnnotationElementClosure() {
  function TextAnnotationElement(parameters) {
    var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(TextAnnotationElement, AnnotationElement, {
    render: function TextAnnotationElement_render() {
      this.container.className = 'textAnnotation';
      var image = document.createElement('img');
      image.style.height = this.container.style.height;
      image.style.width = this.container.style.width;
      image.src = this.imageResourcesPath + 'annotation-' + this.data.name.toLowerCase() + '.svg';
      image.alt = '[{{type}} Annotation]';
      image.dataset.l10nId = 'text_annotation_type';
      image.dataset.l10nArgs = JSON.stringify({ type: this.data.name });
      if (!this.data.hasPopup) {
        this._createPopup(this.container, image, this.data);
      }
      this.container.appendChild(image);
      return this.container;
    }
  });
  return TextAnnotationElement;
}();
var WidgetAnnotationElement = function WidgetAnnotationElementClosure() {
  function WidgetAnnotationElement(parameters, isRenderable) {
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(WidgetAnnotationElement, AnnotationElement, {
    render: function WidgetAnnotationElement_render() {
      return this.container;
    }
  });
  return WidgetAnnotationElement;
}();
var TextWidgetAnnotationElement = function TextWidgetAnnotationElementClosure() {
  var TEXT_ALIGNMENT = ['left', 'center', 'right'];
  function TextWidgetAnnotationElement(parameters) {
    var isRenderable = parameters.renderInteractiveForms || !parameters.data.hasAppearance && !!parameters.data.fieldValue;
    WidgetAnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(TextWidgetAnnotationElement, WidgetAnnotationElement, {
    render: function TextWidgetAnnotationElement_render() {
      this.container.className = 'textWidgetAnnotation';
      var element = null;
      if (this.renderInteractiveForms) {
        if (this.data.multiLine) {
          element = document.createElement('textarea');
          element.textContent = this.data.fieldValue;
        } else {
          element = document.createElement('input');
          element.type = 'text';
          element.setAttribute('value', this.data.fieldValue);
        }
        element.disabled = this.data.readOnly;
        if (this.data.maxLen !== null) {
          element.maxLength = this.data.maxLen;
        }
        if (this.data.comb) {
          var fieldWidth = this.data.rect[2] - this.data.rect[0];
          var combWidth = fieldWidth / this.data.maxLen;
          element.classList.add('comb');
          element.style.letterSpacing = 'calc(' + combWidth + 'px - 1ch)';
        }
      } else {
        element = document.createElement('div');
        element.textContent = this.data.fieldValue;
        element.style.verticalAlign = 'middle';
        element.style.display = 'table-cell';
        var font = null;
        if (this.data.fontRefName) {
          font = this.page.commonObjs.getData(this.data.fontRefName);
        }
        this._setTextStyle(element, font);
      }
      if (this.data.textAlignment !== null) {
        element.style.textAlign = TEXT_ALIGNMENT[this.data.textAlignment];
      }
      this.container.appendChild(element);
      return this.container;
    },
    _setTextStyle: function TextWidgetAnnotationElement_setTextStyle(element, font) {
      var style = element.style;
      style.fontSize = this.data.fontSize + 'px';
      style.direction = this.data.fontDirection < 0 ? 'rtl' : 'ltr';
      if (!font) {
        return;
      }
      style.fontWeight = font.black ? font.bold ? '900' : 'bold' : font.bold ? 'bold' : 'normal';
      style.fontStyle = font.italic ? 'italic' : 'normal';
      var fontFamily = font.loadedName ? '"' + font.loadedName + '", ' : '';
      var fallbackName = font.fallbackName || 'Helvetica, sans-serif';
      style.fontFamily = fontFamily + fallbackName;
    }
  });
  return TextWidgetAnnotationElement;
}();
var CheckboxWidgetAnnotationElement = function CheckboxWidgetAnnotationElementClosure() {
  function CheckboxWidgetAnnotationElement(parameters) {
    WidgetAnnotationElement.call(this, parameters, parameters.renderInteractiveForms);
  }
  Util.inherit(CheckboxWidgetAnnotationElement, WidgetAnnotationElement, {
    render: function CheckboxWidgetAnnotationElement_render() {
      this.container.className = 'buttonWidgetAnnotation checkBox';
      var element = document.createElement('input');
      element.disabled = this.data.readOnly;
      element.type = 'checkbox';
      if (this.data.fieldValue && this.data.fieldValue !== 'Off') {
        element.setAttribute('checked', true);
      }
      this.container.appendChild(element);
      return this.container;
    }
  });
  return CheckboxWidgetAnnotationElement;
}();
var RadioButtonWidgetAnnotationElement = function RadioButtonWidgetAnnotationElementClosure() {
  function RadioButtonWidgetAnnotationElement(parameters) {
    WidgetAnnotationElement.call(this, parameters, parameters.renderInteractiveForms);
  }
  Util.inherit(RadioButtonWidgetAnnotationElement, WidgetAnnotationElement, {
    render: function RadioButtonWidgetAnnotationElement_render() {
      this.container.className = 'buttonWidgetAnnotation radioButton';
      var element = document.createElement('input');
      element.disabled = this.data.readOnly;
      element.type = 'radio';
      element.name = this.data.fieldName;
      if (this.data.fieldValue === this.data.buttonValue) {
        element.setAttribute('checked', true);
      }
      this.container.appendChild(element);
      return this.container;
    }
  });
  return RadioButtonWidgetAnnotationElement;
}();
var ChoiceWidgetAnnotationElement = function ChoiceWidgetAnnotationElementClosure() {
  function ChoiceWidgetAnnotationElement(parameters) {
    WidgetAnnotationElement.call(this, parameters, parameters.renderInteractiveForms);
  }
  Util.inherit(ChoiceWidgetAnnotationElement, WidgetAnnotationElement, {
    render: function ChoiceWidgetAnnotationElement_render() {
      this.container.className = 'choiceWidgetAnnotation';
      var selectElement = document.createElement('select');
      selectElement.disabled = this.data.readOnly;
      if (!this.data.combo) {
        selectElement.size = this.data.options.length;
        if (this.data.multiSelect) {
          selectElement.multiple = true;
        }
      }
      for (var i = 0, ii = this.data.options.length; i < ii; i++) {
        var option = this.data.options[i];
        var optionElement = document.createElement('option');
        optionElement.textContent = option.displayValue;
        optionElement.value = option.exportValue;
        if (this.data.fieldValue.indexOf(option.displayValue) >= 0) {
          optionElement.setAttribute('selected', true);
        }
        selectElement.appendChild(optionElement);
      }
      this.container.appendChild(selectElement);
      return this.container;
    }
  });
  return ChoiceWidgetAnnotationElement;
}();
var PopupAnnotationElement = function PopupAnnotationElementClosure() {
  function PopupAnnotationElement(parameters) {
    var isRenderable = !!(parameters.data.title || parameters.data.contents);
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(PopupAnnotationElement, AnnotationElement, {
    render: function PopupAnnotationElement_render() {
      this.container.className = 'popupAnnotation';
      var selector = '[data-annotation-id="' + this.data.parentId + '"]';
      var parentElement = this.layer.querySelector(selector);
      if (!parentElement) {
        return this.container;
      }
      var popup = new PopupElement({
        container: this.container,
        trigger: parentElement,
        color: this.data.color,
        title: this.data.title,
        contents: this.data.contents
      });
      var parentLeft = parseFloat(parentElement.style.left);
      var parentWidth = parseFloat(parentElement.style.width);
      CustomStyle.setProp('transformOrigin', this.container, -(parentLeft + parentWidth) + 'px -' + parentElement.style.top);
      this.container.style.left = parentLeft + parentWidth + 'px';
      this.container.appendChild(popup.render());
      return this.container;
    }
  });
  return PopupAnnotationElement;
}();
var PopupElement = function PopupElementClosure() {
  var BACKGROUND_ENLIGHT = 0.7;
  function PopupElement(parameters) {
    this.container = parameters.container;
    this.trigger = parameters.trigger;
    this.color = parameters.color;
    this.title = parameters.title;
    this.contents = parameters.contents;
    this.hideWrapper = parameters.hideWrapper || false;
    this.pinned = false;
  }
  PopupElement.prototype = {
    render: function PopupElement_render() {
      var wrapper = document.createElement('div');
      wrapper.className = 'popupWrapper';
      this.hideElement = this.hideWrapper ? wrapper : this.container;
      this.hideElement.setAttribute('hidden', true);
      var popup = document.createElement('div');
      popup.className = 'popup';
      var color = this.color;
      if (color) {
        var r = BACKGROUND_ENLIGHT * (255 - color[0]) + color[0];
        var g = BACKGROUND_ENLIGHT * (255 - color[1]) + color[1];
        var b = BACKGROUND_ENLIGHT * (255 - color[2]) + color[2];
        popup.style.backgroundColor = Util.makeCssRgb(r | 0, g | 0, b | 0);
      }
      var contents = this._formatContents(this.contents);
      var title = document.createElement('h1');
      title.textContent = this.title;
      this.trigger.addEventListener('click', this._toggle.bind(this));
      this.trigger.addEventListener('mouseover', this._show.bind(this, false));
      this.trigger.addEventListener('mouseout', this._hide.bind(this, false));
      popup.addEventListener('click', this._hide.bind(this, true));
      popup.appendChild(title);
      popup.appendChild(contents);
      wrapper.appendChild(popup);
      return wrapper;
    },
    _formatContents: function PopupElement_formatContents(contents) {
      var p = document.createElement('p');
      var lines = contents.split(/(?:\r\n?|\n)/);
      for (var i = 0, ii = lines.length; i < ii; ++i) {
        var line = lines[i];
        p.appendChild(document.createTextNode(line));
        if (i < ii - 1) {
          p.appendChild(document.createElement('br'));
        }
      }
      return p;
    },
    _toggle: function PopupElement_toggle() {
      if (this.pinned) {
        this._hide(true);
      } else {
        this._show(true);
      }
    },
    _show: function PopupElement_show(pin) {
      if (pin) {
        this.pinned = true;
      }
      if (this.hideElement.hasAttribute('hidden')) {
        this.hideElement.removeAttribute('hidden');
        this.container.style.zIndex += 1;
      }
    },
    _hide: function PopupElement_hide(unpin) {
      if (unpin) {
        this.pinned = false;
      }
      if (!this.hideElement.hasAttribute('hidden') && !this.pinned) {
        this.hideElement.setAttribute('hidden', true);
        this.container.style.zIndex -= 1;
      }
    }
  };
  return PopupElement;
}();
var HighlightAnnotationElement = function HighlightAnnotationElementClosure() {
  function HighlightAnnotationElement(parameters) {
    var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(HighlightAnnotationElement, AnnotationElement, {
    render: function HighlightAnnotationElement_render() {
      this.container.className = 'highlightAnnotation';
      if (!this.data.hasPopup) {
        this._createPopup(this.container, null, this.data);
      }
      return this.container;
    }
  });
  return HighlightAnnotationElement;
}();
var UnderlineAnnotationElement = function UnderlineAnnotationElementClosure() {
  function UnderlineAnnotationElement(parameters) {
    var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(UnderlineAnnotationElement, AnnotationElement, {
    render: function UnderlineAnnotationElement_render() {
      this.container.className = 'underlineAnnotation';
      if (!this.data.hasPopup) {
        this._createPopup(this.container, null, this.data);
      }
      return this.container;
    }
  });
  return UnderlineAnnotationElement;
}();
var SquigglyAnnotationElement = function SquigglyAnnotationElementClosure() {
  function SquigglyAnnotationElement(parameters) {
    var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(SquigglyAnnotationElement, AnnotationElement, {
    render: function SquigglyAnnotationElement_render() {
      this.container.className = 'squigglyAnnotation';
      if (!this.data.hasPopup) {
        this._createPopup(this.container, null, this.data);
      }
      return this.container;
    }
  });
  return SquigglyAnnotationElement;
}();
var StrikeOutAnnotationElement = function StrikeOutAnnotationElementClosure() {
  function StrikeOutAnnotationElement(parameters) {
    var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
    AnnotationElement.call(this, parameters, isRenderable);
  }
  Util.inherit(StrikeOutAnnotationElement, AnnotationElement, {
    render: function StrikeOutAnnotationElement_render() {
      this.container.className = 'strikeoutAnnotation';
      if (!this.data.hasPopup) {
        this._createPopup(this.container, null, this.data);
      }
      return this.container;
    }
  });
  return StrikeOutAnnotationElement;
}();
var FileAttachmentAnnotationElement = function FileAttachmentAnnotationElementClosure() {
  function FileAttachmentAnnotationElement(parameters) {
    AnnotationElement.call(this, parameters, true);
    var file = this.data.file;
    this.filename = getFilenameFromUrl(file.filename);
    this.content = file.content;
    this.linkService.onFileAttachmentAnnotation({
      id: stringToPDFString(file.filename),
      filename: file.filename,
      content: file.content
    });
  }
  Util.inherit(FileAttachmentAnnotationElement, AnnotationElement, {
    render: function FileAttachmentAnnotationElement_render() {
      this.container.className = 'fileAttachmentAnnotation';
      var trigger = document.createElement('div');
      trigger.style.height = this.container.style.height;
      trigger.style.width = this.container.style.width;
      trigger.addEventListener('dblclick', this._download.bind(this));
      if (!this.data.hasPopup && (this.data.title || this.data.contents)) {
        this._createPopup(this.container, trigger, this.data);
      }
      this.container.appendChild(trigger);
      return this.container;
    },
    _download: function FileAttachmentAnnotationElement_download() {
      if (!this.downloadManager) {
        warn('Download cannot be started due to unavailable download manager');
        return;
      }
      this.downloadManager.downloadData(this.content, this.filename, '');
    }
  });
  return FileAttachmentAnnotationElement;
}();
var AnnotationLayer = function AnnotationLayerClosure() {
  return {
    render: function AnnotationLayer_render(parameters) {
      var annotationElementFactory = new AnnotationElementFactory();
      for (var i = 0, ii = parameters.annotations.length; i < ii; i++) {
        var data = parameters.annotations[i];
        if (!data) {
          continue;
        }
        var element = annotationElementFactory.create({
          data: data,
          layer: parameters.div,
          page: parameters.page,
          viewport: parameters.viewport,
          linkService: parameters.linkService,
          downloadManager: parameters.downloadManager,
          imageResourcesPath: parameters.imageResourcesPath || getDefaultSetting('imageResourcesPath'),
          renderInteractiveForms: parameters.renderInteractiveForms || false
        });
        if (element.isRenderable) {
          parameters.div.appendChild(element.render());
        }
      }
    },
    update: function AnnotationLayer_update(parameters) {
      for (var i = 0, ii = parameters.annotations.length; i < ii; i++) {
        var data = parameters.annotations[i];
        var element = parameters.div.querySelector('[data-annotation-id="' + data.id + '"]');
        if (element) {
          CustomStyle.setProp('transform', element, 'matrix(' + parameters.viewport.transform.join(',') + ')');
        }
      }
      parameters.div.removeAttribute('hidden');
    }
  };
}();
exports.AnnotationLayer = AnnotationLayer;