define(["brease"], function (brease) {

    /**
     * @class widgets.3dviewer.ThreejsViewer.libs.Utils
     * @extends brease.core.Class
     * Provides utility functions for the ThreejsViewer widget
     */
    const Utils = brease.core.Class.extend(function Utils(widget) {
        this.widget = widget;
        this._loadingScreen = null;
    });

    const p = Utils.prototype;

    /**
     * @method showLoadingScreen
     * Show loading screen with spinner
     */
    p.showLoadingScreen = function() {
        this._loadingScreen = $(`
            <div class="threejs-loading-screen">
                <div class="loading-spinner"></div>
            </div>
        `);

        this._loadingScreen.css({
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "white",
            fontFamily: "Arial, sans-serif",
        });

        this._loadingScreen.find(".loading-spinner").css({
            width: "50px",
            height: "50px",
            border: "5px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "#3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
        });

        this._loadingScreen.append(`<div class="loading-text">Loading...</div>`);
        this._loadingScreen.append(`
            <div class="loading-progress" style="width: 80%; height: 10px; background-color: rgba(255, 255, 255, 0.3); margin-top: 10px;">
                <div class="loading-progress-bar" style="width: 0%; height: 100%; background-color: #3498db;"></div>
            </div>
        `);

        this._loadingScreen.find(".loading-progress-bar").css({
            transition: "width 0.5s ease",
        });
        this._loadingScreen.find(".loading-text").css({
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "10px",
        });
        this._loadingScreen.find(".loading-progress").css({
            position: "relative",
            width: "80%",
            height: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "5px",
            overflow: "hidden",
        });

        this.widget._container.css("position", "relative").append(this._loadingScreen);

        if (!$("#spin-keyframes").length) {
            $('<style id="spin-keyframes">')
                .text("@keyframes spin { to { transform: rotate(360deg); } }")
                .appendTo("head");
        }
    };

    /**
     * @method updateLoadingScreen
     * Update loading screen progress
     * @param {Number} progress - Progress value (0 to 1)
     * @param {String} text - Optional text to display
     */
    p.updateLoadingScreen = function(progress, text) {
        if (this._loadingScreen) {
            this._loadingScreen.find(".loading-progress-bar").css({
                width: `${progress * 100}%`,
            });
            if (text) {
                this._loadingScreen.find(".loading-text").text(text);
            }
        }
    };

    /**
     * @method hideLoadingScreen
     * Hide loading screen with fade-out animation
     */
    p.hideLoadingScreen = function() {
        if (this._loadingScreen) {
            this._loadingScreen.css({
                transition: "opacity 0.5s ease",
                opacity: 0,
            });

            setTimeout(() => {
                this._loadingScreen.remove();
                this._loadingScreen = null;
            }, 500);
        }
    };

    return Utils;
});