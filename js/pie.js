/* InfoVis Project By Armando Cincotti*/

var	radius = Math.min(width-50, height-50) / 2;
var innerRadius = radius*.28;

var svg2 = d3.select("#piechart").append("div").attr("id", "pie").attr("class", "col-md-8")
	.append("svg")
		.attr("width", width*.8)
		.attr("height", height)

var pieChart = svg2.append("g").attr("class", "chart pie")
		.attr("transform", "translate(" + w*.25 + "," + height/2 + ")");

var pieColors = d3.scaleOrdinal().range(["#884988", '#4aa52c', "#a52c2c", "#2C7CA7", '#b7b71a']).domain(d3.range(6));

var	formatPercent = d3.format(".2%"),
	formatThousands = d3.format(",");

var pie = d3.pie()
	.sort(null)
	.value(function(d) { return d.value.alberghi_arrivi; });

var path = d3.arc()
	.outerRadius(radius)
	.innerRadius(innerRadius);

var pathHover = d3.arc()
	.outerRadius(radius + 15)
	.innerRadius(innerRadius);

var label = d3.arc()
	.outerRadius(radius +20)
	.innerRadius(radius +20);

var outerArc = d3.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);


/**************PIE CHART**************/
function drawPie(data){
	var sum = d3.sum(data, function(d) {return d.value.alberghi_arrivi;} );

	var arc = pieChart.append('g').attr("id", "pie-group").selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");

	arc.append("path").attr("class", "arcpath")
		.attr("d", path)
		.attr("fill", function(d) { return pieColors(d.data.key); });

	arc.append("circle").attr("class", "labelrect")
    	.attr("r", innerRadius*.9);

	var label = arc.append("text").attr("class", "pie label")
		.style("display", "none")
		.attr("text", '')

	label.append('tspan').attr("id", "pietspan0").text(function(d) { return formatPercent(d.value/sum);})
        	.attr('x', "0").attr('dy', '-0.52em')

    label.append('tspan').attr("id", "pietspan2").text("valore:")
			.attr("x", "0").attr('dy', '1.51em')

	label.append('tspan').attr("id", "pietspan1").text(function(d) { return formatThousands(d.value); })
			.attr("x", "0").attr('dy', '1em');
	
	arc.on("mousemove", function(d){
			d3.select(this).select('.arcpath').transition().duration(300).ease(d3.easeLinear).attr("d", pathHover);
			d3.select(this).select(".labelrect").style("fill", function() { return pieColors(d.data.key); });
			d3.select(this).select("text").style("display", "inline-block");
			d3.select(this).select(".labelrect").style("opacity", 1);
		});

	arc.on("mouseout", function(d){
			d3.select(this).select('.arcpath').transition().duration(300).ease(d3.easeLinear).attr("d", path);
			d3.select(this).select("text").style("display", "none");
			d3.select(this).select(".labelrect").style("opacity", 0);
		});

	var legend = svg2.append("g").attr("class", "pie legend")
			.attr("transform", "translate(0," + (height/2 - 127.5) + ")")
		.selectAll("g").data(data.map(function(d) { return d.key; }))
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 60 + ")"; });

	legend.append("rect").attr("class", "legend-pie-rect")
		.attr("x", width*.7)
		.attr("width", "1em")
		.attr("height", ".25em")
		.attr("fill", function(d){return pieColors(d);});

	legend.append("text")
		.attr("x", width)
		.attr("y", 7.5)
		.attr("text", '')
		.append('tspan').text(function(d){ return d; })
        	.attr('x', (width*.7)-10).attr('dy', '0.32em');
}

function updatePie(data, selectedValue){
	pie = pie.value(function(d) { return d.value[selectedValue]; });

	var sum = d3.sum(data, function(d) {return d.value[selectedValue];} );

	var update = pieChart.selectAll(".arc").data(pie(data));
	update.transition().duration(750).attrTween("d", arcTween)
		.select("path").attr("d", path)

	update.select("#pietspan0")
			.text(function(d) { return formatPercent(d.value/sum); })	

	update.select("#pietspan1")
			.text(function(d) { return formatThousands(d.value); });

	update.on("mousemove", function(d){
	     	d3.select(this).select('.arcpath').transition().duration(300).ease(d3.easeLinear).attr("d", pathHover);
			d3.select(this).select(".labelrect").style("fill", function() { return pieColors(d.data.key); })
			d3.select(this).select("text").style("display", "inline-block");
			d3.select(this).select(".labelrect").style("opacity", 1);
		});

	update.on("mouseout", function(d){
			d3.select(this).select('.arcpath').transition().duration(300).ease(d3.easeLinear).attr("d", path);
			d3.select(this).select("text").style("display", "none");
			d3.select(this).select(".labelrect").style("opacity", 0);
		});
}

function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		return path(i(t));
		};
}

function midAngle(d){
	return d.startAngle + (d.endAngle - d.startAngle)/2;
}

d3.csv("data/dataset_turismo.csv", function(d,i,columns){
	for (var j = 3, n = columns.length; j < n; ++j){
		d[columns[j]] = d[columns[j]].split('.').join("");
		d[columns[j]] = +d[columns[j]];
	}
	return d;
}, function(error, data) {
	if (error) throw error;

	var geo_areas = d3.map(data, function(d) {return d[data.columns[1]]; }).keys();
	var keys = data.columns.slice(3);

	var dataByAreaAndProvince = d3.nest()
		.key(function(d) {return d["area geografica provenienza"];} )
		.key(function(d) {return d["provincia destinazione"];} )
		.rollup(function(v) {return {
			alberghi_arrivi: d3.sum(v, function(d) {return d["esercizi alberghieri - arrivi"];}),
			alberghi_presenze: d3.sum(v, function(d) {return d["esercizi alberghieri - presenze"];}),
			altro_arrivi: d3.sum(v, function(d) {return d["esercizi complementari - arrivi"];}),
			altro_presenze: d3.sum(v, function(d) {return d["esercizi complementari - presenze"];}),
			tot_arrivi: d3.sum(v, function(d) {return d["totale esercizi ricettivi - arrivi"];}),
			tot_presenze: d3.sum(v, function(d) {return d["totale esercizi ricettivi - presenze"]})
		}; } )
		.entries(data);

	var quantitativeValues = d3.keys(dataByAreaAndProvince[0].values[0].value).map(function(d,i){ return {label: keys[i], value:d}; })
	console.log(quantitativeValues);

	pieColors.domain(dataByAreaAndProvince[0].values.map(function(d){return d.key;}));


	var select = d3.select("#select_area").on('change', onChange);
	var options = select.selectAll('option').data(geo_areas)
		.enter().append('option')
		.text(function(d) {return d;})
		.property("selected", function(d){ return d === geo_areas[0]; });

	select = d3.select("#select_value").on('change', onChange);
	options = select.selectAll('option').data(quantitativeValues)
		.enter().append('option')
		.text(function(d) {return d.label;})
		.attr("value", function(d){return d.value})
		.property("selected", function(d){ return d.label === quantitativeValues[0].label; });

	//setto la modal-box
	var modal_pie = d3.select('#myModal-pie'); 

	var pie_arrow = d3.select('#arrow-pie').select('span');

	var span_pie = document.getElementsByClassName("close")[1];

	pie_arrow.on("click", function(){
		modal_pie.style("display", "block");
		drawPie(dataByAreaAndProvince[0].values);
	});

	span_pie.onclick = function() {
	    modal_pie.style("display", "none");
	    d3.select("#pie-group").remove();
	    d3.select(".pie.legend").remove();
	}

	window.onclick = function(event) {
	    if (event.target == modal_pie) {
	        modal_pie.style("display", "none");
	    }
	}
	//drawPie(dataByAreaAndProvince[0].values);

	function onChange(){
		selectArea = d3.select('#select_area').property('value');
		selectedValue = d3.select('#select_value').property('value');

		if(selectArea==geo_areas[0]) {
			
			updatePie(dataByAreaAndProvince[0].values, selectedValue);
		}
		
		if(selectArea==geo_areas[1]) {
			
			updatePie(dataByAreaAndProvince[1].values, selectedValue);
		}

		if(selectArea==geo_areas[2]) {
			
			updatePie(dataByAreaAndProvince[2].values, selectedValue);
		}
	}

	console.log(JSON.stringify(dataByAreaAndProvince));

})//THE END