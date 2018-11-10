"use strict";

var { makeElement, simplifyString } = require('./../../commons/utils');

function TypeSelector (typesProvider, callback) {
  this.callback = callback;
  this.element = makeElement('div', { className: 'selector' });
  this.input = makeElement('input', { type: 'text', placeholder: 'Type node name', value: '' });
  this.container = makeElement('div', { className: 'types-container'});

  this.element.appendChild(this.input);
  this.element.appendChild(this.container);

  this.positionX = 0;
  this.positionY = 0;

  var types = typesProvider.getAllTypes();
  var collator = new Intl.Collator("en-u-co-phonetic");
  types.sort(function (a, b) {
    return collator.compare(a.name, b.name);
  });

  this.options = [];

  for (var i = 0; i < types.length; i++) {
    var id = types[i].id;
    var name = types[i].name;
    var element = makeElement('div', { className: 'type', 'data-id': id, innerText: name });
    this.options.push({
      id: id,
      name: simplifyString(name),
      element: element,
      enable: true
    });

    this.container.appendChild(element);
  }

  this.isActive = false;
  this.bounce = null;
  this.lastValue = '';

  this.addEvents();

  document.body.appendChild(this.element);
}

TypeSelector.prototype.addEvents = function () {
  this.element.addEventListener('mousedown', e => {
    e.stopPropagation();
  });

  this.element.addEventListener('mousedown', e => {
    e.stopPropagation();

    if (e.target.classList.contains('type')) {
      this.choose(e.target.getAttribute('data-id'));
      this.close();
    }
  });

  this.input.addEventListener('keydown', e => {
    e.stopPropagation();
    var code = e.keyCode || e.charCode;

    if (code === 27) {
      this.close();
    } else if (code === 13) {
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].enable) {
          this.choose(this.options[i].id);
          break;
        }
      }

      this.close();
    }
  });

  this.input.addEventListener('blur', e => {
    if (this.isActive) {
      this.close();
    }
  });

  this.input.addEventListener('keyup', e => {
    e.stopPropagation();
  });

  this.input.addEventListener('keypress', e => {
    e.stopPropagation();
  });

  this.input.addEventListener('input', e => {
    var value = simplifyString(this.input.value);

    this.clearBounce();

    if (this.lastValue !== value) {
      this.bounce = setTimeout(_ => {
        this.filter(value);
        this.bounce = null;
      }, 120);
    }
  });
};

TypeSelector.prototype.clearBounce = function () {
  if (this.bounce !== null) {
    clearTimeout(this.bounce);
    this.bounce = null;
  }
};

TypeSelector.prototype.filter = function (value) {
  for (var i = 0; i < this.options.length; i++) {
    if (value.length === 0 || this.options[i].name.indexOf(value) !== -1) {
      this.options[i].enable = true;
      this.container.appendChild(this.options[i].element);
    } else if (this.options[i].element.parentNode !== null) {
      this.options[i].enable = false;
      this.options[i].element.parentNode.removeChild(this.options[i].element);
    }
  }

  this.lastValue = value;
};

TypeSelector.prototype.choose = function (value) {
  this.callback(value);
};

TypeSelector.prototype.open = function () {
  this.isActive = true;
  this.filter('');
  this.input.value = '';
  this.input.focus();
  this.element.style.transform = 'translate(' + this.positionX + 'px, ' + this.positionY + 'px)';
  this.element.classList.add('active');
};

TypeSelector.prototype.close = function () {
  this.clearBounce();
  this.element.classList.remove('active');
  this.isActive = false;
  this.input.blur();
};

TypeSelector.prototype.isOpen = function () {
  return this.isActive;
};

TypeSelector.prototype.toggle = function () {
  if (this.isActive) {
    this.close();
  } else {
    this.open();
  }
};

TypeSelector.prototype.setNextPosition = function (x, y) {
  if (!this.isActive) {
    x = Math.max(0, Math.min(window.innerWidth - 202, x - 25));
    y = Math.max(0, Math.min(window.innerHeight - 302, y - 40));
    this.positionX = x;
    this.positionY = y;
  }
};

module.exports = TypeSelector;