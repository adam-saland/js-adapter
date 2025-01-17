import { Base } from '../base';
import { Identity, GroupWindowIdentity } from '../../identity';
import { Application } from '../application/application';
import Transport from '../../transport/transport';
import { WindowEvents } from '../events/window';
import { AnchorType, Bounds, Transition, TransitionOptions } from '../../shapes';
import { WindowOption } from './windowOption';
import { EntityType } from '../frame/frame';
import { ExternalWindow } from '../external-window/external-window';
import { validateIdentity } from '../../util/validate';
import { WebContents } from '../webcontents/webcontents';

/**
 * @lends Window
 */
// tslint:disable-next-line
export default class _WindowModule extends Base {
    /**
     * Asynchronously returns a Window object that represents an existing window.
     * @param { Identity } identity
     * @return {Promise.<_Window>}
     * @tutorial Window.wrap
     * @static
     */
    public async wrap(identity: Identity): Promise<_Window> {
        const errorMsg = validateIdentity(identity);
        if (errorMsg) {
            throw new Error(errorMsg);
        }
        return new _Window(this.wire, identity);
    }

    /**
     * Synchronously returns a Window object that represents an existing window.
     * @param { Identity } identity
     * @return {_Window}
     * @tutorial Window.wrapSync
     * @static
     */
    public wrapSync(identity: Identity): _Window {
        const errorMsg = validateIdentity(identity);
        if (errorMsg) {
            throw new Error(errorMsg);
        }
        return new _Window(this.wire, identity);
    }

    /**
     * Creates a new Window.
     * @param { Window~options } options - Window creation options
     * @return {Promise.<_Window>}
     * @tutorial Window.create
     * @static
     */
    public create(options: WindowOption): Promise<_Window> {
        const win = new _Window(this.wire, { uuid: this.me.uuid, name: options.name });
        return win.createWindow(options);
    }

    /**
     * Asynchronously returns a Window object that represents the current window
     * @return {Promise.<_Window>}
     * @tutorial Window.getCurrent
     * @static
     */
    public getCurrent(): Promise<_Window> {
        return this.wrap(this.wire.me);
    }

    /**
     * Synchronously returns a Window object that represents the current window
     * @return {_Window}
     * @tutorial Window.getCurrentSync
     * @static
     */
    public getCurrentSync(): _Window {
        return this.wrapSync(this.wire.me);
    }
}

export interface CloseEventShape {
    name: string;
    uuid: string;
    type: string;
    topic: string;
}

export interface WindowInfo {
    canNavigateBack: boolean;
    canNavigateForward: boolean;
    preloadScripts: Array<any>;
    title: string;
    url: string;
}

export interface FrameInfo {
    name: string;
    uuid: string;
    entityType: EntityType;
    parent?: Identity;
}

export interface Area {
    height: number;
    width: number;
    x: number;
    y: number;
}

interface WindowMovementOptions {
    moveIndependently: boolean;
}

/**
 * @typedef {object} Window~options
 * @summary Window creation options.
 * @desc This is the options object required by {@link Window.create Window.create}.
 *
 * Note that `name` is the only required property — albeit the `url` property is usually provided as well
 * (defaults to `"about:blank"` when omitted).
 *
 * _This jsdoc typedef mirrors the `WindowOptions` TypeScript interface in `@types/openfin`._
 *
 * @property {object} [accelerator]
 * Enable keyboard shortcuts for devtools, zoom, reload, and reload ignoring cache.
 *
 * @property {boolean} [accelerator.devtools=false]
 * If `true`, enables the devtools keyboard shortcut:<br>
 * `Ctrl` + `Shift` + `I` _(Toggles Devtools)_
 *
 * @property {boolean} [accelerator.reload=false]
 * If `true`, enables the reload keyboard shortcuts:<br>
 * `Ctrl` + `R` _(Windows)_<br>
 * `F5` _(Windows)_<br>
 * `Command` + `R` _(Mac)_
 *
 * @property {boolean} [accelerator.reloadIgnoringCache=false]
 * If `true`, enables the reload-from-source keyboard shortcuts:<br>
 * `Ctrl` + `Shift` + `R` _(Windows)_<br>
 * `Shift` + `F5` _(Windows)_<br>
 * `Command` + `Shift` + `R` _(Mac)_
 *
 * @property {boolean} [accelerator.zoom=false]
 * If `true`, enables the zoom keyboard shortcuts:<br>
 * `Ctrl` + `+` _(Zoom In)_<br>
 * `Ctrl` + `Shift` + `+` _(Zoom In)_<br>
 * `Ctrl` + `-` _(Zoom Out)_<br>
 * `Ctrl` + `Shift` + `-` _(Zoom Out)_<br>
 * `Ctrl` + `Scroll` _(Zoom In & Out)_<br>
 * `Ctrl` + `0` _(Restore to 100%)_
 *
 * @property {object} [alphaMask] - _Experimental._  _Updatable._
 * <br>
 * alphaMask turns anything of matching RGB value transparent.
 * <br>
 * Caveats:
 * * runtime key --disable-gpu is required. Note: Unclear behavior on remote Desktop support
 * * User cannot click-through transparent regions
 * * Not supported on Mac
 * * Windows Aero must be enabled
 * * Won't make visual sense on Pixel-pushed environments such as Citrix
 * * Not supported on rounded corner windows
 * @property {number} [alphaMask.red=-1] 0-255
 * @property {number} [alphaMask.green=-1] 0-255
 * @property {number} [alphaMask.blue=-1] 0-255
 *
 * @property {boolean} [alwaysOnTop=false] - _Updatable._
 * A flag to always position the window at the top of the window stack.
 *
 * @property {object} [api]
 * Configurations for API injection.
 *
 * @property {object} [api.iframe] Configure if the the API should be injected into iframes based on domain.
 *
 * @property {boolean} [api.iframe.crossOriginInjection=false] Controls if the `fin` API object is present for cross origin iframes.
 * @property {boolean} [api.iframe.sameOriginInjection=true] Controls if the `fin` API object is present for same origin iframes.
 *
 * @property {string} [applicationIcon = ""] - _Deprecated_ - use `icon` instead.
 *
 * @property {number} [aspectRatio=0] - _Updatable._
 * The aspect ratio of width to height to enforce for the window. If this value is equal to or less than zero,
 * an aspect ratio will not be enforced.
 *
 * @property {boolean} [autoShow=true]
 * A flag to automatically show the window when it is created.
 *
 * @property {string} [backgroundColor="#FFF"]
 * The window’s _backfill_ color as a hexadecimal value. Not to be confused with the content background color
 * (`document.body.style.backgroundColor`),
 * this color briefly fills a window’s (a) content area before its content is loaded as well as (b) newly exposed
 * areas when growing a window. Setting
 * this value to the anticipated content background color can help improve user experience.
 * Default is white.
 *
 * @property {object} [contentNavigation]
 * Restrict navigation to URLs that match a whitelisted pattern.
 * In the lack of a whitelist, navigation to URLs that match a blacklisted pattern would be prohibited.
 * See [here](https://developer.chrome.com/extensions/match_patterns) for more details.
 * @property {string[]} [contentNavigation.whitelist=[]] List of whitelisted URLs.
 * @property {string[]} [contentNavigation.blacklist=[]] List of blacklisted URLs.

 * @property {boolean} [contextMenu=true] - _Updatable._
 * A flag to show the context menu when right-clicking on a window.
 * Gives access to the devtools for the window.
 *
 * @property {object} [contextMenuSettings] - _Updatable._
 * Configure the context menu when right-clicking on a window.
 * @property {boolean} [contextMenuSettings.enable=true] Should the context menu display on right click.
 * @property {boolean} [contextMenuSettings.devtools=true] Should the context menu contain a button for opening devtools.
 * @property {boolean} [contextMenuSettings.reload=true] Should the context menu contain a button for reloading the page.
 *
 * @property {object} [cornerRounding] - _Updatable._
 * Defines and applies rounded corners for a frameless window. **NOTE:** On macOS corner is not ellipse but circle rounded by the
 *  average of _height_ and _width_.
 * @property {number} [cornerRounding.height=0] The height in pixels.
 * @property {number} [cornerRounding.width=0] The width in pixels.
 *
 * @property {any} [customData=""] - _Updatable._
 * A field that the user can attach serializable data to to be ferried around with the window options.
 * _When omitted, the default value of this property is the empty string (`""`)._
 *
 * @property {customRequestHeaders[]} [customRequestHeaders]
 * Defines list of {@link customRequestHeaders} for requests sent by the window.
 *
 * @property {boolean} [defaultCentered=false]
 * Centers the window in the primary monitor. This option overrides `defaultLeft` and `defaultTop`. When `saveWindowState` is `true`,
 * this value will be ignored for subsequent launches in favor of the cached value. **NOTE:** On macOS _defaultCenter_ is
 * somewhat above center vertically.
 *
 * @property {number} [defaultHeight=500]
 * The default height of the window. When `saveWindowState` is `true`, this value will be ignored for subsequent launches
 * in favor of the cached value.
 *
 * @property {number} [defaultLeft=100]
 * The default left position of the window. When `saveWindowState` is `true`, this value will be ignored for subsequent
 * launches in favor of the cached value.
 *
 * @property {number} [defaultTop=100]
 * The default top position of the window. When `saveWindowState` is `true`, this value will be ignored for subsequent
 * launches in favor of the cached value.
 *
 * @property {number} [defaultWidth=800]
 * The default width of the window. When `saveWindowState` is `true`, this value will be ignored for subsequent
 * launches in favor of the cached value.
 *
 * @property {boolean} [frame=true] - _Updatable._
 * A flag to show the frame.
 *
 * @hidden-property {boolean} [hideOnClose=false] - A flag to allow a window to be hidden when the close button is clicked.
 *
 * @property {string} [icon] - _Updatable. Inheritable._
 * A URL for the icon to be shown in the window title bar and the taskbar.
 * _When omitted, inherits from the parent application._
 *
 * @property {number} [maxHeight=-1] - _Updatable._
 * The maximum height of a window. Will default to the OS defined value if set to -1.
 *
 * @property {boolean} [maximizable=true] - _Updatable._
 * A flag that lets the window be maximized.
 *
 * @property {number} [maxWidth=-1] - _Updatable._
 * The maximum width of a window. Will default to the OS defined value if set to -1.
 *
 * @property {number} [minHeight=0] - _Updatable._
 * The minimum height of a window.
 *
 * @property {boolean} [minimizable=true] - _Updatable._
 * A flag that lets the window be minimized.
 *
 * @property {number} [minWidth=0] - _Updatable._
 * The minimum width of a window.
 *
 * @property {string} name
 * The name of the window.
 *
 * @property {number} [opacity=1.0] - _Updatable._
 * A flag that specifies how transparent the window will be.
 * This value is clamped between `0.0` and `1.0`.
 *
 * @property {preloadScript[]} [preloadScripts] - _Inheritable_
 * A list of scripts that are eval'ed before other scripts in the page. When omitted, _inherits_
 * from the parent application.
 *
 * @property {boolean} [resizable=true] - _Updatable._
 * A flag to allow the user to resize the window.
 *
 * @property {object} [resizeRegion] - _Updatable._
 * Defines a region in pixels that will respond to user mouse interaction for resizing a frameless window.
 * @property {number} [resizeRegion.bottomRightCorner=9]
 * The size in pixels of an additional square resizable region located at the bottom right corner of a frameless window.
 * @property {number} [resizeRegion.size=7]
 * The size in pixels.
 * @property {object} [resizeRegion.sides={top:true,right:true,bottom:true,left:true}]
 * Sides that a window can be resized from.
 *
 * @property {boolean} [saveWindowState=true]
 * A flag to cache the location of the window.
 *
 * @property {boolean} [shadow=false]
 * A flag to display a shadow on frameless windows.
 * `shadow` and `cornerRounding` are mutually exclusive.
 * On Windows 7, Aero theme is required.
 *
 * @property {boolean} [showTaskbarIcon=true] - _Updatable._ _Windows_.
 * A flag to show the window's icon in the taskbar.
 *
 * @property {boolean} [smallWindow=false]
 * A flag to specify a frameless window that can be be created and resized to less than 41x36px (width x height).
 * _Note: Caveats of small windows are no Aero Snap and drag to/from maximize._
 *
 * @property {string} [state="normal"]
 * The visible state of the window on creation.
 * One of:
 * * `"maximized"`
 * * `"minimized"`
 * * `"normal"`
 *
 * @property {string} [taskbarIcon=string] - Deprecated - use `icon` instead._Windows_.
 *
 * @property {string} [taskbarIconGroup=<application uuid>] - _Windows_.
 * Specify a taskbar group for the window.
 * _If omitted, defaults to app's uuid (`fin.Application.getCurrentSync().identity.uuid`)._
 *
 * @property {string} [url="about:blank"]
 * The URL of the window.
 *
 * @property {string} [uuid=<application uuid>]
 * The `uuid` of the application, unique within the set of all `Application`s running in OpenFin Runtime.
 * If omitted, defaults to the `uuid` of the application spawning the window.
 * If given, must match the `uuid` of the  application spawning the window.
 * In other words, the application's `uuid` is the only acceptable value, but is the default, so there's
 * really no need to provide it.
 *
 * @property {boolean} [waitForPageLoad=false]
 * When set to `true`, the window will not appear until the `window` object's `load` event fires.
 * When set to `false`, the window will appear immediately without waiting for content to be loaded.
 */

/**
 * @typedef { object } Area
 * @property { number } height Area's height
 * @property { number } width Area's width
 * @property { number } x X coordinate of area's starting point
 * @property { number } y Y coordinate of area's starting point
 */

/**
 * @typedef { object } WindowMovementOptions
 * @property { boolean } moveIndependently - Move a window independently of its group or along with its group. Defaults to false.
 */

/**
 * @typedef {object} Transition
 * @property {Opacity} opacity - The Opacity transition
 * @property {Position} position - The Position transition
 * @property {Size} size - The Size transition
*/

/**
 * @typedef {object} TransitionOptions
 * @property {boolean} interrupt - This option interrupts the current animation. When false it pushes
this animation onto the end of the animation queue.
 * @property {boolean} relative - Treat 'opacity' as absolute or as a delta. Defaults to false.
 */

/**
 * @typedef {object} Size
 * @property {number} duration - The total time in milliseconds this transition should take.
 * @property {boolean} relative - Treat 'opacity' as absolute or as a delta. Defaults to false.
 * @property {number} width - Optional if height is present. Defaults to the window's current width.
 * @property {number} height - Optional if width is present. Defaults to the window's current height.
 */

/**
 * @typedef {object} Position
 * @property {number} duration - The total time in milliseconds this transition should take.
 * @property {boolean} relative - Treat 'opacity' as absolute or as a delta. Defaults to false.
 * @property {number} left - Defaults to the window's current left position in virtual screen coordinates.
 * @property {number} top - Defaults to the window's current top position in virtual screen coordinates.
 */

/**
 * @typedef {object} Opacity
 * @property {number} duration - The total time in milliseconds this transition should take.
 * @property {boolean} relative - Treat 'opacity' as absolute or as a delta. Defaults to false.
 * @property {number} opacity - This value is clamped from 0.0 to 1.0.
*/

/**
 * Bounds is a interface that has the properties of height,
 * width, left, top which are all numbers
 * @typedef { object } Bounds
 * @property { number } height Get the application height bound
 * @property { number } width Get the application width bound
 * @property { number } top Get the application top bound
 * @property { number } left Get the application left bound
 * @property { number } right Get the application right bound
 * @property { number } bottom Get the application bottom bound
 */

/**
 * @classdesc A basic window that wraps a native HTML window. Provides more fine-grained
 * control over the window state such as the ability to minimize, maximize, restore, etc.
 * By default a window does not show upon instantiation; instead the window's show() method
 * must be invoked manually. The new window appears in the same process as the parent window.
 * It has the ability to listen for <a href="tutorial-Window.EventEmitter.html">window specific events</a>.
 * @class
 * @alias Window
 * @hideconstructor
 */
// The window.Window name is taken
// tslint:disable-next-line
export class _Window extends WebContents<WindowEvents> {

    constructor(wire: Transport, public identity: Identity) {
        super(wire, identity, 'window');
    }

    /**
     * Adds a listener to the end of the listeners array for the specified event.
     * @param { string | symbol } eventType  - The type of the event.
     * @param { Function } listener - Called whenever an event of the specified type occurs.
     * @param { SubOptions } [options] - Option to support event timestamps.
     * @return {Promise.<this>}
     * @function addListener
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */

    /**
     * Adds a listener to the end of the listeners array for the specified event.
     * @param { string | symbol } eventType  - The type of the event.
     * @param { Function } listener - Called whenever an event of the specified type occurs.
     * @param { SubOptions } [options] - Option to support event timestamps.
     * @return {Promise.<this>}
     * @function on
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */

    /**
     * Adds a one time listener for the event. The listener is invoked only the first time the event is fired, after which it is removed.
     * @param { string | symbol } eventType  - The type of the event.
     * @param { Function } listener - The callback function.
     * @param { SubOptions } [options] - Option to support event timestamps.
     * @return {Promise.<this>}
     * @function once
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */

    /**
     * Adds a listener to the beginning of the listeners array for the specified event.
     * @param { string | symbol } eventType  - The type of the event.
     * @param { Function } listener - The callback function.
     * @param { SubOptions } [options] - Option to support event timestamps.
     * @return {Promise.<this>}
     * @function prependListener
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */

    /**
     * Adds a one time listener for the event. The listener is invoked only the first time the event is fired, after which it is removed.
     * The listener is added to the beginning of the listeners array.
     * @param { string | symbol } eventType  - The type of the event.
     * @param { Function } listener - The callback function.
     * @param { SubOptions } [options] - Option to support event timestamps.
     * @return {Promise.<this>}
     * @function prependOnceListener
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */

    /**
     * Remove a listener from the listener array for the specified event.
     * Caution: Calling this method changes the array indices in the listener array behind the listener.
     * @param { string | symbol } eventType  - The type of the event.
     * @param { Function } listener - The callback function.
     * @param { SubOptions } [options] - Option to support event timestamps.
     * @return {Promise.<this>}
     * @function removeListener
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */

    /**
     * Removes all listeners, or those of the specified event.
     * @param { string | symbol } [eventType]  - The type of the event.
     * @return {Promise.<this>}
     * @function removeAllListeners
     * @memberof Window
     * @instance
     * @tutorial Window.EventEmitter
     */
    /**
    * Returns the zoom level of the window.
    * @function getZoomLevel
    * @memberOf Window
    * @instance
    * @return {Promise.<number>}
    * @tutorial Window.getZoomLevel
    */

    /**
     * Sets the zoom level of the window.
     * @param { number } level The zoom level
     * @function setZoomLevel
     * @memberOf Window
     * @instance
     * @return {Promise.<void>}
     * @tutorial Window.setZoomLevel
     */

    /**
     * Navigates the window to a specified URL. The url must contain the protocol prefix such as http:// or https://.
     * @param {string} url - The URL to navigate the window to.
     * @function navigate
     * @memberOf Window
     * @instance
     * @return {Promise.<void>}
     * @tutorial Window.navigate
     */

    /**
     * Navigates the window back one page.
     * @function navigateBack
     * @memberOf Window
     * @instance
     * @return {Promise.<void>}
     * @tutorial Window.navigateBack
     */

    /**
     * Navigates the window forward one page.
     * @function navigateForward
     * @memberOf Window
     * @instance
     * @return {Promise.<void>}
     * @tutorial Window.navigateForward
     */

    /**
     * Stops any current navigation the window is performing.
     * @function stopNavigation
     * @memberOf Window
     * @instance
     * @return {Promise.<void>}
     * @tutorial Window.stopNavigation
     */

    // create a new window
    public createWindow(options: WindowOption): Promise<_Window> {
        return new Promise((resolve, reject) => {
            const CONSTRUCTOR_CB_TOPIC = 'fire-constructor-callback';
            // need to call pageResponse, otherwise when a child window is created, page is not loaded
            const pageResponse = new Promise((resolve) => {
                // tslint:disable-next-line
                this.on(CONSTRUCTOR_CB_TOPIC, function fireConstructor(response: any) {
                    let cbPayload;
                    const success = response.success;
                    const responseData = response.data;
                    const message = responseData.message;

                    if (success) {
                        cbPayload = {
                            httpResponseCode: responseData.httpResponseCode,
                            apiInjected: responseData.apiInjected
                        };
                    } else {
                        cbPayload = {
                            message: responseData.message,
                            networkErrorCode: responseData.networkErrorCode,
                            stack: responseData.stack
                        };
                    }

                    this.removeListener(CONSTRUCTOR_CB_TOPIC, fireConstructor);
                    resolve({
                        message: message,
                        cbPayload: cbPayload,
                        success: success
                    });
                });
            });

            //set defaults:
            if (options.waitForPageLoad === void 0) {
                options.waitForPageLoad = false;
            }
            if (options.autoShow === void 0) {
                options.autoShow = true;
            }

            const windowCreation = this.wire.environment.createChildWindow(options);
            Promise.all([pageResponse, windowCreation]).then((resolvedArr: any[]) => {
                const pageResolve = resolvedArr[0];
                if (pageResolve.success) {
                    resolve(this);
                } else {
                    reject(pageResolve);
                }
                try {
                    // this is to enforce a 5.0 contract that the child's main function
                    // will not fire before the parent's success callback on creation.
                    // if the child window is not accessible (CORS) this contract does
                    // not hold.
                    const webWindow: any = this.getWebWindow();
                    webWindow.fin.__internal_.openerSuccessCBCalled();
                } catch (e) {
                    //common for main windows, we do not want to expose this error. here just to have a debug target.
                    //console.error(e);
                }
            }).catch(reject);
        });
    }

    private windowListFromNameList(identityList: Array<GroupWindowIdentity>): Array<_Window | ExternalWindow> {
        return identityList.map(({ uuid, name, isExternalWindow }) => {
            if (isExternalWindow) {
                return new ExternalWindow(this.wire, { uuid });
            } else {
                return new _Window(this.wire, { uuid, name });
            }
        });
    }

    /**
     * Retrieves an array of frame info objects representing the main frame and any
     * iframes that are currently on the page.
     * @return {Promise.<Array<FrameInfo>>}
     * @tutorial Window.getAllFrames
     */
    public getAllFrames(): Promise<Array<FrameInfo>> {
        return this.wire.sendAction('get-all-frames', this.identity).then(({ payload }) => payload.data);
    }

    /**
     * Gets the current bounds (top, bottom, right, left, width, height) of the window.
     * @return {Promise.<Bounds>}
     * @tutorial Window.getBounds
    */
    public getBounds(): Promise<Bounds> {
        return this.wire.sendAction('get-window-bounds', this.identity)
            // tslint:disable-next-line
            .then(({ payload }) => payload.data as Bounds);
    }

    /**
     * Gives focus to the window.
     * @return {Promise.<void>}
     * @emits _Window#focused
     * @tutorial Window.focus
     */
    public focus(): Promise<void> {
        return this.wire.sendAction('focus-window', this.identity).then(() => undefined);
    }

    /**
     * Centers the window on its current screen.
     * @return {Promise.<void>}
     * @tutorial Window.center
     */
    public center(): Promise<void> {
        return this.wire.sendAction('center-window', this.identity).then(() => undefined);
    }

    /**
     * Removes focus from the window.
     * @return {Promise.<void>}
     * @tutorial Window.blur
     */
    public blur(): Promise<void> {
        return this.wire.sendAction('blur-window', this.identity).then(() => undefined);
    }

    /**
     * Brings the window to the front of the window stack.
     * @return {Promise.<void>}
     * @tutorial Window.bringToFront
     */
    public bringToFront(): Promise<void> {
        return this.wire.sendAction('bring-window-to-front', this.identity).then(() => undefined);
    }

    /**
     * Performs the specified window transitions.
     * @param {Transition} transitions - Describes the animations to perform. See the tutorial.
     * @param {TransitionOptions} options - Options for the animation. See the tutorial.
     * @return {Promise.<void>}
     * @tutorial Window.animate
     */
    public animate(transitions: Transition, options: TransitionOptions): Promise<void> {
        return this.wire.sendAction('animate-window', Object.assign({}, {
            transitions,
            options
        }, this.identity)).then(() => undefined);
    }

    /**
     * Hides the window.
     * @return {Promise.<void>}
     * @tutorial Window.hide
     */
    public hide(): Promise<void> {
        return this.wire.sendAction('hide-window', this.identity).then(() => undefined);
    }

    /**
     * closes the window application
     * @param { boolean } [force = false] Close will be prevented from closing when force is false and
     *  ‘close-requested’ has been subscribed to for application’s main window.
     * @return {Promise.<void>}
     * @tutorial Window.close
    */
    public close(force: boolean = false): Promise<void> {
        return this.wire.sendAction('close-window', Object.assign({}, { force }, this.identity))
            .then(() => {
                Object.setPrototypeOf(this, null);
                return undefined;
            });
    }

    /**
     * Returns the native OS level Id.
     * In Windows, it will return the Windows [handle](https://docs.microsoft.com/en-us/windows/desktop/WinProg/windows-data-types#HWND).
     * @return {Promise.<string>}
     * @tutorial Window.getNativeId
     */
    public getNativeId(): Promise<string> {
        return this.wire.sendAction('get-window-native-id', this.identity)
            .then(({ payload }) => payload.data);
    }

    /*
     * @deprecated Use {@link Window.disableUserMovement} instead.
     */
    public disableFrame(): Promise<void> {
        console.warn('Function is deprecated; use disableUserMovement instead.');
        return this.wire.sendAction('disable-window-frame', this.identity).then(() => undefined);
    }

    /**
     * Prevents a user from changing a window's size/position when using the window's frame.
     * @return {Promise.<void>}
     * @tutorial Window.disableUserMovement
     */
    public disableUserMovement(): Promise<void> {
        return this.wire.sendAction('disable-window-frame', this.identity).then(() => undefined);
    }

    /*
     * @deprecated Use {@link Window.enableUserMovement} instead.
     */
    public enableFrame(): Promise<void> {
        console.warn('Function is deprecated; use enableUserMovement instead.');
        return this.wire.sendAction('enable-window-frame', this.identity).then(() => undefined);
    }

    /**
     * Re-enables user changes to a window's size/position when using the window's frame.
     * @return {Promise.<void>}
     * @tutorial Window.enableUserMovement
     */
    public enableUserMovement(): Promise<void> {
        return this.wire.sendAction('enable-window-frame', this.identity).then(() => undefined);
    }

    /**
     * Executes Javascript on the window, restricted to windows you own or windows owned by
     * applications you have created.
     * @param { string } code JavaScript code to be executed on the window.
     * @function executeJavaScript
     * @memberOf Window
     * @instance
     * @return {Promise.<void>}
     * @tutorial Window.executeJavaScript
     */

    /**
     * Flashes the window’s frame and taskbar icon until stopFlashing is called or until a focus event is fired.
     * @return {Promise.<void>}
     * @tutorial Window.flash
     */
    public flash(): Promise<void> {
        return this.wire.sendAction('flash-window', this.identity).then(() => undefined);
    }

    /**
     * Stops the taskbar icon from flashing.
     * @return {Promise.<void>}
     * @tutorial Window.stopFlashing
     */
    public stopFlashing(): Promise<void> {
        return this.wire.sendAction('stop-flash-window', this.identity).then(() => undefined);
    }

    /**
     * Retrieves an array containing wrapped fin.Windows that are grouped with this window.
     * If a window is not in a group an empty array is returned. Please note that
     * calling window is included in the result array.
     * @return {Promise.<Array<_Window|ExternalWindow>>}
     * @tutorial Window.getGroup
     */
    public getGroup(): Promise<Array<_Window | ExternalWindow>> {
        return this.wire.sendAction('get-window-group', Object.assign({}, {
            crossApp: true // cross app group supported
        }, this.identity)).then(({ payload }) => {
            // tslint:disable-next-line
            let winGroup: Array<_Window | ExternalWindow> = [] as Array<_Window | ExternalWindow>;

            if (payload.data.length) {
                winGroup = this.windowListFromNameList(payload.data);
            }
            return winGroup;
        });
    }

    /**
     * Gets an information object for the window.
     * @return {Promise.<WindowInfo>}
     * @tutorial Window.getInfo
     */
    public getInfo(): Promise<WindowInfo> {
        return this.wire.sendAction('get-window-info', this.identity).then(({ payload }) => payload.data);
    }

    /**
     * Gets the current settings of the window.
     * @return {Promise.<any>}
     * @tutorial Window.getOptions
     */
    public getOptions(): Promise<any> {
        return this.wire.sendAction('get-window-options', this.identity).then(({ payload }) => payload.data);
    }

    /**
     * Gets the parent application.
     * @return {Promise.<Application>}
     * @tutorial Window.getParentApplication
     */
    public getParentApplication(): Promise<Application> {
        return Promise.resolve(new Application(this.wire, this.identity));
    }

    /**
     * Gets the parent window.
     * @return {Promise.<_Window>}
     * @tutorial Window.getParentWindow
     */
    public getParentWindow(): Promise<_Window> {
        return Promise.resolve(new Application(this.wire, this.identity)).then(app => app.getWindow());
    }

    /**
     * Gets a base64 encoded PNG snapshot of the window or just part a of it.
     * @param { Area } [area] The area of the window to be captured.
     * Omitting it will capture the whole visible window.
     * @return {Promise.<string>}
     * @tutorial Window.getSnapshot
     */
    public async getSnapshot(area?: Area): Promise<string> {
        const req = Object.assign({}, { area }, this.identity);
        const res = await this.wire.sendAction('get-window-snapshot', req);
        return res.payload.data;
    }

    /**
     * Gets the current state ("minimized", "maximized", or "restored") of the window.
     * @return {Promise.<string>}
     * @tutorial Window.getState
     */
    public getState(): Promise<string> {
        return this.wire.sendAction('get-window-state', this.identity).then(({ payload }) => payload.data);
    }

    /**
     * Gets the [Window Object](https://developer.mozilla.org/en-US/docs/Web/API/Window) previously getNativeWindow
     * @return {object}
     * @tutorial Window.getWebWindow
     */
    public getWebWindow(): Window {
        return this.wire.environment.getWebWindow(this.identity);
    }

    /**
     * Determines if the window is a main window.
     * @return {boolean}
     * @tutorial Window.isMainWindow
     */
    public isMainWindow(): boolean {
        return this.me.uuid === this.me.name;
    }

    /**
     * Determines if the window is currently showing.
     * @return {Promise.<boolean>}
     * @tutorial Window.isShowing
     */
    public isShowing(): Promise<boolean> {
        return this.wire.sendAction('is-window-showing', this.identity).then(({ payload }) => payload.data);
    }

    /**
     * Joins the same window group as the specified window.
     * Joining a group with native windows is currently not supported(method will nack).
     * @param { _Window | ExternalWindow } target The window whose group is to be joined
     * @return {Promise.<void>}
     * @tutorial Window.joinGroup
     */
    public joinGroup(target: _Window | ExternalWindow): Promise<void> {
        return this.wire.sendAction('join-window-group', Object.assign({}, {
            groupingUuid: target.identity.uuid,
            groupingWindowName: target.identity.name
        }, this.identity)).then(() => undefined);
    }

    /**
     * Reloads the window current page
     * @return {Promise.<void>}
     * @tutorial Window.reload
     */
    public reload(ignoreCache: boolean = false): Promise<void> {
        return this.wire.sendAction('reload-window', Object.assign({}, {
            ignoreCache
        }, this.identity)).then(() => undefined);
    }

    /**
     * Leaves the current window group so that the window can be move independently of those in the group.
     * @return {Promise.<void>}
     * @tutorial Window.leaveGroup
     */
    public leaveGroup(): Promise<void> {
        return this.wire.sendAction('leave-window-group', this.identity).then(() => undefined);
    }

    /**
     * Maximizes the window
     * @return {Promise.<void>}
     * @tutorial Window.maximize
     */
    public maximize(): Promise<void> {
        return this.wire.sendAction('maximize-window', this.identity).then(() => undefined);
    }

    /**
     * Merges the instance's window group with the same window group as the specified window
     * @param { _Window | ExternalWindow } target The window whose group is to be merged with
     * @return {Promise.<void>}
     * @tutorial Window.mergeGroups
     */
    public mergeGroups(target: _Window | ExternalWindow): Promise<void> {
        return this.wire.sendAction('merge-window-groups', Object.assign({}, {
            groupingUuid: target.identity.uuid,
            groupingWindowName: target.identity.name
        }, this.identity)).then(() => undefined);
    }

    /**
     * Minimizes the window.
     * @return {Promise.<void>}
     * @tutorial Window.minimize
     */
    public minimize(): Promise<void> {
        return this.wire.sendAction('minimize-window', this.identity).then(() => undefined);
    }

    /**
     * Moves the window by a specified amount.
     * @param { number } deltaLeft The change in the left position of the window
     * @param { number } deltaTop The change in the top position of the window
     * @param { WindowMovementOptions } options Optional parameters to modify window movement
     * @return {Promise.<void>}
     * @tutorial Window.moveBy
     */
    public moveBy(deltaLeft: number, deltaTop: number, options: WindowMovementOptions = { moveIndependently: false }): Promise<void> {
        return this.wire.sendAction('move-window-by', Object.assign({}, {
            deltaLeft,
            deltaTop,
            options
        }, this.identity)).then(() => undefined);
    }

    /**
     * Moves the window to a specified location.
     * @param { number } left The left position of the window
     * @param { number } top The top position of the window
     * @param { WindowMovementOptions } options Optional parameters to modify window movement
     * @return {Promise.<void>}
     * @tutorial Window.moveTo
     */
    public moveTo(left: number, top: number, options: WindowMovementOptions = { moveIndependently: false }): Promise<void> {
        return this.wire.sendAction('move-window', Object.assign({}, {
            left,
            top,
            options
        }, this.identity)).then(() => undefined);
    }

    /**
     * Resizes the window by a specified amount.
     * @param { number } deltaWidth The change in the width of the window
     * @param { number } deltaHeight The change in the height of the window
     * @param { AnchorType } anchor Specifies a corner to remain fixed during the resize.
     * Can take the values: "top-left", "top-right", "bottom-left", or "bottom-right".
     * If undefined, the default is "top-left"
     * @param { WindowMovementOptions } options Optional parameters to modify window movement
     * @return {Promise.<void>}
     * @tutorial Window.resizeBy
     */
    public resizeBy(deltaWidth: number, deltaHeight: number, anchor: AnchorType,
        options: WindowMovementOptions = { moveIndependently: false }): Promise<void> {
        return this.wire.sendAction('resize-window-by', Object.assign({}, {
            deltaWidth: Math.floor(deltaWidth),
            deltaHeight: Math.floor(deltaHeight),
            anchor,
            options
        }, this.identity)).then(() => undefined);
    }

    /**
     * Resizes the window to the specified dimensions.
     * @param { number } width The change in the width of the window
     * @param { number } height The change in the height of the window
     * @param { AnchorType } anchor Specifies a corner to remain fixed during the resize.
     * Can take the values: "top-left", "top-right", "bottom-left", or "bottom-right".
     * If undefined, the default is "top-left"
     * @param { WindowMovementOptions } options Optional parameters to modify window movement
     * @return {Promise.<void>}
     * @tutorial Window.resizeTo
     */
    public resizeTo(width: number, height: number, anchor: AnchorType,
        options: WindowMovementOptions = { moveIndependently: false }): Promise<void> {
        return this.wire.sendAction('resize-window', Object.assign({}, {
            width: Math.floor(width),
            height: Math.floor(height),
            anchor,
            options
        }, this.identity)).then(() => undefined);
    }

    /**
     * Restores the window to its normal state (i.e., unminimized, unmaximized).
     * @return {Promise.<void>}
     * @tutorial Window.restore
     */
    public restore(): Promise<void> {
        return this.wire.sendAction('restore-window', this.identity).then(() => undefined);
    }

    /**
     * Will bring the window to the front of the entire stack and give it focus.
     * @return {Promise.<void>}
     * @tutorial Window.setAsForeground
     */
    public setAsForeground(): Promise<void> {
        return this.wire.sendAction('set-foreground-window', this.identity).then(() => undefined);
    }

    /**
     * Sets the window's size and position.
     * @property { Bounds } bounds This is a * @type {string} name - name of the window.object that holds the propertys of
     * @param { WindowMovementOptions } options Optional parameters to modify window movement
     * @return {Promise.<void>}
     * @tutorial Window.setBounds
     */
    public setBounds(bounds: Bounds, options: WindowMovementOptions = { moveIndependently: false }): Promise<void> {
        return this.wire.sendAction('set-window-bounds', Object.assign({}, { ...bounds, options }, this.identity)).then(() => undefined);
    }

    /**
     * Shows the window if it is hidden.
     * @param { boolean } [force = false] Show will be prevented from showing when force is false and
     *  ‘show-requested’ has been subscribed to for application’s main window.
     * @return {Promise.<void>}
     * @tutorial Window.show
     */
    public show(force: boolean = false): Promise<void> {
        return this.wire.sendAction('show-window', Object.assign({}, { force }, this.identity)).then(() => undefined);
    }

    /**
     * Shows the window if it is hidden at the specified location.
     * If the toggle parameter is set to true, the window will
     * alternate between showing and hiding.
     * @param { number } left The left position of the window
     * @param { number } top The right position of the window
     * @param { boolean } force Show will be prevented from closing when force is false and
     * ‘show-requested’ has been subscribed to for application’s main window
     * @param { WindowMovementOptions } options Optional parameters to modify window movement
     * @return {Promise.<void>}
     * @tutorial Window.showAt
     */
    public showAt(left: number, top: number, force: boolean = false,
        options: WindowMovementOptions = { moveIndependently: false }): Promise<void> {
        return this.wire.sendAction('show-at-window', Object.assign({}, {
            force,
            left: Math.floor(left),
            top: Math.floor(top),
            options
        }, this.identity)).then(() => undefined);
    }

    /**
     * Shows the Chromium Developer Tools
     * @return {Promise.<void>}
     * @tutorial Window.showDeveloperTools
     */
    public showDeveloperTools(): Promise<void> {
        return this.wire.sendAction('show-developer-tools', this.identity).then(() => undefined);
    }

    /**
     * Updates the window using the passed options.
     * Values that are objects are deep-merged, overwriting only the values that are provided.
     * @param {*} options Changes a window's options that were defined upon creation. See tutorial
     * @return {Promise.<void>}
     * @tutorial Window.updateOptions
     */
    public updateOptions(options: any): Promise<void> {
        return this.wire.sendAction('update-window-options', Object.assign({}, { options }, this.identity)).then(() => undefined);
    }

    /**
     * Provides credentials to authentication requests
     * @param { string } userName userName to provide to the authentication challenge
     * @param { string } password password to provide to the authentication challenge
     * @return {Promise.<void>}
     * @tutorial Window.authenticate
     */
    public authenticate(userName: string, password: string): Promise<void> {
        return this.wire.sendAction('window-authenticate', Object.assign({}, { userName, password }, this.identity)).then(() => undefined);
    }

}
