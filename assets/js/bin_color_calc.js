$(document).ready(function () {
    var bin_calc_colors = {};
    var btn = document.querySelector('button.js-download');
    var svg = document.querySelector('#house');
    var canvas = document.querySelector('canvas');


    function triggerDownload(imgURI) {
        var evt = new MouseEvent('click', {
            view: window,
            bubbles: false,
            cancelable: true
        });

        var a = document.createElement('a');
        a.setAttribute('download', 'bin-doma.ru_colors.png');
        a.setAttribute('href', imgURI);
        a.setAttribute('target', '_blank');

        a.dispatchEvent(evt);
    }

    btn.addEventListener('click', function () {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var data = (new XMLSerializer()).serializeToString(svg);
        var DOMURL = window.URL || window.webkitURL || window;
        var img = new Image();
        var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        var url = DOMURL.createObjectURL(svgBlob);
        img.src = url;
        img.onload = function () {
            canvas.width = 1900;
            canvas.height = 950;
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(url);
            var imgURI = canvas
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream');
            triggerDownload(imgURI);
        };
    });

    $(document).on("click", ".js-download", function (e) {
        e.preventDefault();


    });

    $(document).on("click", ".bin_calc-panel__list-item", function (e) {
        let color_type = $(this).data("color");
        let svg = $(this).data("svg");
        $(this).addClass("bin_calc-panel__list-item--active").siblings().removeClass("bin_calc-panel__list-item--active");
        $(".js-bin_calc-panel__colors[data-type='" + color_type + "']").addClass("bin_calc-panel__colors--active").siblings().removeClass("bin_calc-panel__colors--active");
        $(".js-bin_calc-panel__colors[data-type='" + color_type + "'] .bin_calc-panel__colors-item").removeClass("bin_calc-panel__colors-item--active");
        if (bin_calc_colors[svg].color) {
            $(".js-bin_calc-panel__colors[data-type='" + color_type + "'] .bin_calc-panel__colors-item[data-color_id='" + bin_calc_colors[svg].color_id + "']").addClass("bin_calc-panel__colors-item--active");
        }
    });

    $(document).on("click", ".bin_calc-panel__colors-item", function (e) {
        let svg = $(".bin_calc-panel__list-item--active").data('svg');
        if (!$(this).hasClass("bin_calc-panel__colors-item--active")) {
            bin_calc_colors[svg].color = $(this).data("rgb");
            bin_calc_colors[svg].color_id = $(this).data("color_id");

            $(this).addClass("bin_calc-panel__colors-item--active").siblings().removeClass("bin_calc-panel__colors-item--active");
            $(".bin_calc-panel__list-item.bin_calc-panel__list-item--active").addClass("bin_calc-panel__list-item--selected");
        } else{
            bin_calc_colors[svg].color = "none";
            bin_calc_colors[svg].color_id = "";
            $(this).removeClass("bin_calc-panel__colors-item--active");
            $(".bin_calc-panel__list-item.bin_calc-panel__list-item--active").removeClass("bin_calc-panel__list-item--selected");
        }
        paintHouse();
    });


    function paintHouse() {
        for (id in bin_calc_colors)
            if (bin_calc_colors[id]) {
                $("#"+id).css("opacity", "1");
                $("#" + id + " .cls-area").css({ "fill": bin_calc_colors[id].color, "opacity": "0.7"});
            }
    }

    function buildList(json) {
        let list = $(".js-bin_calc-panel__list");
        for (let i = 0; i < json.areas.length; i++) {
            bin_calc_colors[json.areas[i].svg_id] = {};
            $("<li></li>").addClass("bin_calc-panel__list-item").attr({
                "data-svg": json.areas[i].svg_id,
                "data-color": json.areas[i].color_type
            }).text(json.areas[i].name).appendTo(list);
        }
    }
    function buildColors(json) {
        let types = ["colors", "roofs", "windows", "under_roofs", "seal"];
        for (let t = 0; t < types.length; t++) {
            const type = types[t];
            let colors = $(".js-bin_calc-panel__colors[data-type='"+type+"']");
            let colors_arr = json[type];
            let groups = [];

            for (let i = 0; i < colors_arr.length; i++) {
                let color = $("<li></li>").addClass("bin_calc-panel__colors-item").attr({
                    "data-rgb": colors_arr[i].rgb,
                    "data-color_id": type + i,
                    'title': colors_arr[i].color,
                });
                if (colors_arr[i].image) $("<img />").attr('src', colors_arr[i].image).appendTo(color);
                if (colors_arr[i].opacity) color.attr("data-opacity", colors_arr[i].opacity);

                if (colors_arr[i].group.length){
                    if (!Object.keys(groups).includes(colors_arr[i].group)) {
                        groups[colors_arr[i].group] = [];
                        groups[colors_arr[i].group].push($('<div></div>').addClass("bin_calc-panel__colors-group").text(colors_arr[i].group));
                    }
                    groups[colors_arr[i].group].push(color);
                } else {
                    if (!Object.keys(groups).includes('other')) {
                        groups.other = [];
                        groups.other.push($('<div></div>').addClass("bin_calc-panel__colors-group"));
                    }
                    groups.other.push(color);
                }
            }
            for (g in groups) {
                $.each(groups[g], function(i, group) {
                    group.appendTo(colors);
                });
            }

        }
    }


    $.getJSON("/assets/js/bin_calc_colors.json", function (json) {
        var bin_calc = "#bin_calc";
        buildList(json);
        buildColors(json);
    });

});