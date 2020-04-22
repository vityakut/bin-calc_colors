$(document).ready(function () {
    var bin_calc_colors = {};

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

    $(document).on("click", ".js-download", function (e) {
        e.preventDefault();
        let colors = [];
        for (c in bin_calc_colors) {
            if (bin_calc_colors[c].color_id) colors.push(bin_calc_colors[c]);
        }

        var canvas = document.getElementById('canvas');
        var svg = document.getElementById('house');
        var ctx = canvas.getContext('2d');
        var data = (new XMLSerializer()).serializeToString(svg);
        var DOMURL = window.URL || window.webkitURL || window;
        var img = new Image();
        var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        var url = DOMURL.createObjectURL(svgBlob);
        let img_size = {
            'w': 1900,
            'h': 950,
            'footer_columns': 2,
        };
        img_size.footer_rows = Math.ceil(colors.length / 2);
        img_size.footer_h = colors.length ? img_size.footer_rows * 40 + 120 : 0;
        let copyright = 'www.bin-doma.ru';
        img.src = url;
        img.onload = function () {
            canvas.width = img_size.w;
            canvas.height = img_size.h + img_size.footer_h;
            ctx.globalAlpha = 1;
            ctx.drawImage(img, 0, 0, img_size.w, img_size.h);
            let logo = new Image(100,89);
            logo.src = "/assets/images/style/logo-new.png";
            logo.onload = function () {
                ctx.globalAlpha = 0.7;
                ctx.drawImage(logo, 50, img_size.h - 100);
                ctx.globalAlpha = 1;
                if (colors.length) {
                    ctx.fillStyle = 'rgb(255,255,255)';
                    ctx.fillRect(0,img_size.h, img_size.w, img_size.footer_h);
                    ctx.fillStyle = 'rgb(255, 87, 34)';
                    ctx.fillRect(0, img_size.h, img_size.w, 10);
                    ctx.font = '28px sans-serif';
                    ctx.fillStyle = 'rgb(102, 102, 102)';
                    let copyright_w = Math.floor(ctx.measureText(copyright).width) + 40;
                    ctx.fillText(copyright, img_size.w - copyright_w, img_size.h+img_size.footer_h - 40);
                    ctx.fillStyle = 'rgb(20,20,20)';
                    let y = img_size.h + 70;
                    let x = 50;
                    let dx = Math.floor(img_size.w / img_size.footer_columns);
                    let dy = 40;
                    for (let i = 0; i < colors.length; i++) {
                        let group = colors[i].group ? colors[i].group + " - " : "";
                        text = `${colors[i].zone}: ${group}${colors[i].name}`;
                        ctx.fillText(text, x + ((Math.floor(i / img_size.footer_rows)) * dx), y + ((i % img_size.footer_rows) * dy));
                    }
                }

                DOMURL.revokeObjectURL(url);
                var imgURI = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                triggerDownload(imgURI);
            };
        };


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
            bin_calc_colors[svg].zone = $(".bin_calc-panel__list-item.bin_calc-panel__list-item--active").text();
            bin_calc_colors[svg].color = $(this).data("rgb");
            bin_calc_colors[svg].color_id = $(this).data("color_id");
            bin_calc_colors[svg].group = $(this).data("group");
            bin_calc_colors[svg].name = $(this).attr("title");
            $(this).addClass("bin_calc-panel__colors-item--active").siblings().removeClass("bin_calc-panel__colors-item--active");
            $(".bin_calc-panel__list-item.bin_calc-panel__list-item--active").addClass("bin_calc-panel__list-item--selected");
        } else{
            bin_calc_colors[svg] = {};
            bin_calc_colors[svg].color = "none";
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
                    "data-group": colors_arr[i].group,
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