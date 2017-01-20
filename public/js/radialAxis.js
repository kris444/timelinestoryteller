/**

radialAxis: //a reusable radial axis

**/

(function () {

  "use strict";

  d3.radialAxis = function () {

    var radial_axis_scale = d3.scale.linear().range([0,2 * Math.PI]),
    radial_axis_units = "Chronological",
    x_pos = 0,
    y_pos = 0,
    duration = 1000,
    final_quantile = 0,
    track_bounds = 0,
    bc_origin = false,
    longer_than_a_day = true,
    num_ticks = 0;

    function radialAxis (selection) {

      selection.each(function (data) {

        var g = d3.select(this),
        old_radial_axis_scale;

        if (moment(data[0]).year() <= 0) {
          bc_origin = true;
        }
        else {
          bc_origin = false;
        }

        num_ticks = data.length;

        if (segment_granularity == "days" && time.hour.count(time.day.floor(data[0]), time.day.ceil(data[num_ticks - 1])) > 24) {
          longer_than_a_day = true;
        }
        else {
          longer_than_a_day = false;
        }

        //retrieve the old scale, if this is an update
        old_radial_axis_scale = this.__chart__ || d3.scale.linear()
        .range([0,2 * Math.PI])
        .domain(radial_axis_scale.range());

        //stash the new scale and quantiles
        this.__chart__ = radial_axis_scale;

        //concentric track circles
        var radial_axis_tracks = g.selectAll(".radial_tracks")
        .data(d3.range(-1,track_bounds));

        var radial_axis_tracks_enter = radial_axis_tracks.enter()
        .append("g")
        .attr("class","radial_tracks");

        radial_axis_tracks_enter.append("path")
        .attr("class", "rad_track")
        .attr("id", function(d,i) {
          return "rad_track" + i;
        })
        .attr("d", d3.svg.arc()
        .innerRadius(centre_radius - track_height)
        .outerRadius(centre_radius - track_height)
        .startAngle(0)
        .endAngle(radial_axis_scale(final_quantile)))
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        });

        var radial_axis_tracks_update = radial_axis_tracks.transition()
        .delay(function (d, i) {
          return duration + i * duration / track_bounds;
        })
        .duration(duration);

        var radial_axis_tracks_exit = radial_axis_tracks.exit().transition()
        .duration(duration)
        .remove();

        radial_axis_tracks_update.selectAll(".rad_track")
        .attr("d", d3.svg.arc()
        .innerRadius(function (d) {
          return centre_radius + d * track_height;
        })
        .outerRadius(function (d) {
          return centre_radius + d * track_height;
        })
        .startAngle(0)
        .endAngle(radial_axis_scale(final_quantile)))
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        });

        radial_axis_tracks_exit.selectAll(".rad_track")
        .attr("d", d3.svg.arc()
        .innerRadius(centre_radius - track_height)
        .outerRadius(centre_radius - track_height)
        .startAngle(0)
        .endAngle(0))
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        });

        //radial ticks
        var radial_axis_tick = g.selectAll(".radial_axis_tick")
        .data(data);

        var radial_axis_tick_enter = radial_axis_tick.enter()
        .append("g")
        .attr("class", "radial_axis_tick");

        var radial_axis_tick_exit = radial_axis_tick.exit().transition()
        .duration(duration)
        .remove();

        radial_axis_tick_enter.append("path")
        .attr("class","radial_axis_tick_path")
        .attr("d", d3.svg.arc()
        .innerRadius(centre_radius - track_height)
        .outerRadius(centre_radius + track_bounds * track_height - 0.25 * unit_width)
        .startAngle(function (d) {
          return radial_axis_scale(d);
        })
        .endAngle(function (d) {
          return radial_axis_scale(d);
        }))
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        });

        radial_axis_tick_enter.append("text")
        .attr("class","radial_axis_tick_label")
        .attr('text-anchor','middle')
        .attr('dominant-baseline','central')
        .attr("x", function (d) {
          return (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.sin(radial_axis_scale(d));
        })
        .attr("y", function (d) {
          return -1 * (centre_radius + track_bounds * track_height + 0.5 *  unit_width) * Math.cos(radial_axis_scale(d));
        })
        .attr("transform", function (d) {
          var angle = radial_axis_scale(d) * (180 / Math.PI);
          if (angle > 90 && angle <= 180) {
            angle = angle + 180;
          }
          else if (angle < 270 && angle > 180) {
            angle = angle - 180;
          }
          return "translate(" + x_pos + " ," + y_pos + ")rotate(" + angle + "," + (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.sin(radial_axis_scale(d)) + " ," + (-1 * (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.cos(radial_axis_scale(d))) + ")"
        })
        .text(function (d,i) {
          return formatTick(d,i);
        });

        var radial_axis_tick_update = radial_axis_tick.transition()
        .delay(function (d, i) {
          return duration + i * duration / data.length;
        })
        .duration(duration);

        radial_axis_tick_update.select("path")
        .attr("d", d3.svg.arc()
        .innerRadius(centre_radius - track_height)
        .outerRadius(centre_radius + track_bounds * track_height - 0.25 * unit_width)
        .startAngle(function (d) {
          return radial_axis_scale(d);
        })
        .endAngle(function (d) {
          return radial_axis_scale(d);
        }))
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        });

        radial_axis_tick_update.select("text")
        .attr("x", function (d) {
          return (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.sin(radial_axis_scale(d));
        })
        .attr("y", function (d) {
          return -1 * (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.cos(radial_axis_scale(d));
        })
        .text(function (d,i) {
          return formatTick(d,i);
        })
        .attr("transform", function (d) {
          var angle = radial_axis_scale(d) * (180 / Math.PI);
          if (angle > 90 && angle <= 180) {
            angle = angle + 180;
          }
          else if (angle < 270 && angle > 180) {
            angle = angle - 180;
          }
          return "translate(" + x_pos + " ," + y_pos + ")rotate(" + angle + "," + (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.sin(radial_axis_scale(d)) + " ," + (-1 * (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.cos(radial_axis_scale(d))) + ")"
        });

        radial_axis_tick_exit.select("path")
        .attr("d", d3.svg.arc()
        .innerRadius(centre_radius - track_height)
        .outerRadius(centre_radius - track_height)
        .startAngle(function (d) {
          return radial_axis_scale(d);
        })
        .endAngle(function (d) {
          return radial_axis_scale(d);
        }))
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        });

        radial_axis_tick_exit.select("text")
        .attr("x", function (d) {
          return (centre_radius + track_bounds * track_height + 0.5 * unit_width)  * Math.sin(radial_axis_scale(d));
        })
        .attr("y", function (d) {
          return -1 * (centre_radius + track_bounds * track_height + 0.5 * unit_width) * Math.cos(radial_axis_scale(d));
        })
        .attr("transform", function () {
          return "translate(" + x_pos + " ," + y_pos + ")"
        })
        .text(function (d) {
          return "";
        });

      });
      d3.timer.flush();
    }

    function formatTick (d,i) {
      var radial_axis_tick_label = d;

      if (radial_axis_units == "Sequential") {
        radial_axis_tick_label = d;
      }
      else if (radial_axis_units == "Chronological") {
        switch (segment_granularity) {
          case "days":
          if (i == num_ticks - 1) {
            radial_axis_tick_label = "";
          }
          else if (longer_than_a_day) {
            radial_axis_tick_label = moment(d).format('ddd hA');
          }
          else {
            radial_axis_tick_label = moment(d).format("hA");
          }
          break;
          case "weeks":
          radial_axis_tick_label = moment(d).format("ddd MMM D");
          break;
          case "months":
          radial_axis_tick_label = moment(d).format("MMM 'YY");
          break;
          case "years":
          if (moment(d).year() < 0) {
            radial_axis_tick_label = (-1 * moment(d).year()) + " BC";
          }
          else {
            radial_axis_tick_label = +moment(d).year();
            if (bc_origin) {
              radial_axis_tick_label += " AD";
            }
          }
          break;
          case "decades":
          if (moment(d).year() < 0) {
            radial_axis_tick_label = (-1 * moment(d).year()) + " BC";
          }
          else {
            radial_axis_tick_label = +moment(d).year();
            if (bc_origin) {
              radial_axis_tick_label += " AD";
            }
          }
          break;
          case "centuries":
          if (moment(d).year() < 0) {
            radial_axis_tick_label = (-1 * moment(d).year()) + " BC";
          }
          else {
            radial_axis_tick_label = +moment(d).year();
            if (bc_origin) {
              radial_axis_tick_label += " AD";
            }
          }
          break;
          case "millenia":
          if (moment(d).year() < 0) {
            radial_axis_tick_label = (-1 * moment(d).year()) + " BC";
          }
          else {
            radial_axis_tick_label = +moment(d).year();
            if (bc_origin) {
              radial_axis_tick_label += " AD";
            }
          }
          break;
          case "epochs":
          radial_axis_tick_label = formatAbbreviation(d);
          break;
        }
      }
      else if (radial_axis_units == "Segments") {
        switch (segment_granularity) {
          case "days":
          radial_axis_tick_label = moment().hour(d).format('hA');
          break;
          case "weeks":
          radial_axis_tick_label = moment().weekday(d).format('ddd');
          break;
          case "months":
          if ((d - 1) % 7 != 0) {
            radial_axis_tick_label = "";
          }
          else {
            radial_axis_tick_label = moment().date(d).format('Do');
          }
          break;
          case "years":
          if ((d - 1) % 4 == 0) {
            radial_axis_tick_label = "";
          }
          else {
            radial_axis_tick_label = moment().week(d + 1).format('MMM');
          }
          break;
          case "decades":
          radial_axis_tick_label = d + " M";
          break;
          case "centuries":
          radial_axis_tick_label = d + " Y";
          break;
          case "millenia":
          radial_axis_tick_label = d + " Y";
          break;
          case "epochs":
          radial_axis_tick_label = "";
          break;
        }
        if (i == num_ticks - 1) {
          radial_axis_tick_label = "";
        }
      }
      else if (radial_axis_units == "Relative") {
        switch (segment_granularity) {
          case "days":
          radial_axis_tick_label = Math.round(d / 3600000) + " H";
          break;
          case "weeks":
          radial_axis_tick_label = Math.round(d / 86400000) + " D";
          break;
          case "months":
          radial_axis_tick_label = Math.round(d / 604800000) + " W";
          break;
          case "years":
          radial_axis_tick_label = Math.round(d / 2678400000) + " M";
          break;
          case "decades":
          radial_axis_tick_label = Math.round(d / 31536000730) + " Y";
          break;
          case "centuries":
          radial_axis_tick_label = Math.round(d / 31536000730) + " Y";
          break;
          case "millenia":
          radial_axis_tick_label = Math.round(d / 31536000730) + " Y";
          break;
          case "epochs":
          radial_axis_tick_label = "";
          break;
        }
      }
      return radial_axis_tick_label;
    };

    radialAxis.x_pos = function(x) {
      if (!arguments.length) {
        return x_pos;
      }
      x_pos = x;
      return radialAxis;
    };

    radialAxis.y_pos = function(x) {
      if (!arguments.length) {
        return y_pos;
      }
      y_pos = x;
      return radialAxis;
    };

    radialAxis.duration = function(x) {
      if (!arguments.length) {
        return duration;
      }
      duration = x;
      return radialAxis;
    };

    radialAxis.radial_axis_scale = function(x) {
      if (!arguments.length) {
        return radial_axis_scale;
      }
      radial_axis_scale = x;
      return radialAxis;
    };

    radialAxis.radial_axis_units = function(x) {
      if (!arguments.length) {
        return radial_axis_units;
      }
      radial_axis_units = x;
      return radialAxis;
    };

    radialAxis.final_quantile = function(x) {
      if (!arguments.length) {
        return final_quantile;
      }
      final_quantile = x;
      return radialAxis;
    };

    radialAxis.track_bounds = function (x) {
      if (!arguments.length) {
        return track_bounds;
      }
      track_bounds = x;
      return radialAxis;
    }

    radialAxis.bc_origin = function (x) {
      if (!arguments.length) {
        return bc_origin;
      }
      bc_origin = x;
      return radialAxis;
    }

    return radialAxis;
  }

})();