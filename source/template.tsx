/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as DOM from '@singleware/jsx';
import * as Control from '@singleware/ui-control';

import { Properties } from './properties';
import { Element } from './element';

/**
 * Dialog template class.
 */
@Class.Describe()
export class Template<T extends Properties = Properties> extends Control.Component<T> {
  /**
   * Confirmation callback.
   */
  @Class.Private()
  private confirmation?: Class.Callable;

  /**
   * Header element.
   */
  @Class.Private()
  private headerSlot = <slot name="header" class="header" /> as HTMLSlotElement;

  /**
   * Content element.
   */
  @Class.Private()
  private contentSlot = <slot name="content" class="content" /> as HTMLSlotElement;

  /**
   * Footer element.
   */
  @Class.Private()
  private footerSlot = <slot name="footer" class="footer" /> as HTMLSlotElement;

  /**
   * Modal element.
   */
  @Class.Private()
  private modalSlot = <slot name="modal" class="modal" /> as HTMLSlotElement;

  /**
   * Dialog element.
   */
  @Class.Private()
  private dialog = (
    <div class="dialog">
      {this.headerSlot}
      {this.contentSlot}
      {this.footerSlot}
    </div>
  ) as HTMLDivElement;

  /**
   * Wrapper element.
   */
  @Class.Private()
  private wrapper = <div class="wrapper" /> as HTMLDivElement;

  /**
   * Dialog styles.
   */
  @Class.Private()
  private styles = (
    <style>
      {`:host > .modal,
:host > .wrapper {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
}
:host > .modal {
  z-index: 999999999;
  height: 100vh;
}
:host > .wrapper:not(:empty) {
  z-index: 1000000000;
  overflow: auto;
  height: 100vh;
}
:host > .wrapper > .dialog {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
}
:host > .wrapper > .dialog > .header,
:host > .wrapper > .dialog > .content,
:host > .wrapper > .dialog > .footer {
  display: flex;
  flex-direction: column;
}`}
    </style>
  ) as HTMLStyleElement;

  /**
   * Dialog skeleton.
   */
  @Class.Private()
  private skeleton = <div class={this.properties.class}>{this.children}</div> as Element;

  /**
   * Dialog elements.
   */
  @Class.Private()
  private elements = DOM.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.wrapper) as ShadowRoot;

  /**
   * Ignore handler.
   * @param event Event information.
   */
  @Class.Private()
  private ignoreHandler(event: Event): void {
    if (this.properties.canIgnore && event.target === this.dialog) {
      this.hide();
    }
  }

  /**
   * Bind event handlers to update the custom element.
   */
  @Class.Private()
  private bindHandlers(): void {
    this.wrapper.addEventListener('click', this.ignoreHandler.bind(this));
  }

  /**
   * Bind exposed properties to the custom element.
   */
  @Class.Private()
  private bindProperties(): void {
    this.bindComponentProperties(this.skeleton, ['show', 'hide', 'wait']);
  }

  /**
   * Confirm the dialog with success status.
   */
  @Class.Protected()
  protected async success(): Promise<void> {
    if (this.confirmation) {
      this.confirmation(true);
      this.skeleton.dispatchEvent(new Event('success', { bubbles: true, cancelable: false }));
    }
  }

  /**
   * Confirm the dialog with failure status.
   */
  @Class.Protected()
  protected async failure(): Promise<void> {
    if (this.confirmation) {
      this.confirmation(false);
      this.skeleton.dispatchEvent(new Event('failure', { bubbles: true, cancelable: false }));
    }
  }

  /**
   * Default constructor.
   * @param properties Dialog properties.
   * @param children Dialog children.
   */
  constructor(properties?: T, children?: any[]) {
    super(properties, children);
    this.bindHandlers();
    this.bindProperties();
  }

  /**
   * Dialog element.
   */
  @Class.Public()
  public get element(): Element {
    return this.skeleton;
  }

  /**
   * Shows the dialog.
   * @param modal Determines whether the dialog is shown as modal or not.
   */
  @Class.Public()
  public show(modal?: boolean): void {
    if (modal || this.properties.modal) {
      this.elements.insertBefore(this.modalSlot, this.wrapper);
    }
    this.wrapper.appendChild(this.dialog);
    this.skeleton.dispatchEvent(new Event('show', { bubbles: true, cancelable: false }));
  }

  /**
   * Hides the dialog.
   */
  @Class.Public()
  public hide(): void {
    this.modalSlot.remove();
    this.dialog.remove();
    this.skeleton.dispatchEvent(new Event('hide', { bubbles: true, cancelable: false }));
  }

  /**
   * Wait the dialog confirmation.
   * @returns Returns a promise to get true when the action was successful, false otherwise.
   */
  @Class.Public()
  public async wait(): Promise<boolean> {
    return new Promise((resolve: Class.Callable, reject: Class.Callable) => {
      this.confirmation = resolve;
    });
  }
}
