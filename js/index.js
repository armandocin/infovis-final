/* InfoVis Project By Armando Cincotti*/



var margin = {top: 40, right: 100, bottom: 40, left: 150},
	w = 1093,	//larghezza svg
	h = w*.4,	//altezza svg
	width = w - margin.left - margin.right,	//larghezza grafico
	height = h - margin.top - margin.bottom;//altezza grafico

var svg = d3.select("#barchart").append("svg").style("background-color", "#fefefe")
	.attr("width", width+margin.left+margin.right)
	.attr("height", h),

	chart = svg.append("g").attr("class", "chart")
		.attr("transform", "translate(" + margin.left + ","+ margin.top +")");

var x0 = d3.scaleBand()
	.rangeRound([0, width*(3/4)])
	.paddingInner(0.25).paddingOuter(.25);

var x1 = d3.scaleBand()
	.padding(0.1);

var y0 = d3.scaleLinear()
	.rangeRound([height, 0]);

var colors = d3.scaleOrdinal().range(["#06537D", "#2C7CA7", '#247f06', '#4aa52c', "#7f2406", "#a54a2c"]).domain(d3.range(6));

var div = d3.select("#myModal-bar").append("div").attr("id", "tooltip"),
	formatPercent = d3.format(".2%");

function drawAxis(){

	chart.append("g")			
		.attr("class", "grid")
		.call(d3.axisLeft(y0).tickValues(d3.range(y0.domain()[0], y0.domain()[1]+.001, y0.domain()[1]/20)).ticks(21)
		  .tickSize(-width*(3/4))
		  .tickFormat("")
	)

	chart.append("g")
		.attr("class", "axis x")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x0));

	chart.append("g")
		.attr("class", "axis y")
		.call(d3.axisLeft(y0).tickValues(d3.range(y0.domain()[0], y0.domain()[1]+.001, y0.domain()[1]/10)).ticks(null, "%"))

}

/***************CHART 1***************/

function drawOverallChart(data){
	document.getElementById("checkinput").checked = true;
	document.getElementById("buttons").hidden = true;

	//agiornamento dominio colore
	colors.domain([0,1])

	//creazione contenitore grafico 1
	var chart1 = chart.append("g").attr("id", "uno");


	//rimozione gradico 2
	d3.select("#due").remove();


	//data join e clausola enter
	var bars = chart1.append("g")
		.selectAll("g")
		.data(d3.stack().keys(["alberghieri", "complementari"])(data))  //faccio un data join con uno stack generator; esso ritorna un array contente 2 array(uno per ciascuna variabile specificata in keys())

		.enter().append("g")
			.style("fill", function(d){ return colors(d.index); })
		.selectAll(".bar").data(function(d){ return d; }) //per ciascuna variabile faccio un data join così posso appendere una rect per ciascun array interno che contiene gli intervalli dello stack
		
		.enter().append("rect") //appendo una rect per ogni data point(per ogni intervallo dello stack)
			.attr("class", "bar")
			.attr("x", function(d){ return x0(d.data.Key);})  
			.attr("y", function(d){ return y0(d[0]); }) //metto inizialmente le barre alla base del proprio intervallo per la transizione
			.attr("width", x0.bandwidth());
        
	bars.transition().delay(function (d,i){ var parent = d3.select(this.parentNode).datum(); return parent.index * 800;})
			.duration(800).ease(d3.easeLinear)
		.attr("height", function(d) { return y0(d[0]) - y0(d[1]); })
		.attr("y", function(d){ return y0(d[1]); });
      
	bars.on("mousemove", function(d){
			div.style("left", d3.event.pageX+10+"px");
			div.style("top", d3.event.pageY-25+"px");
			div.style("display", "inline-block");
			div.html( "<em>notti per esercizi "+d3.select(this.parentNode).datum().key+" di "+(d.data.Key)+"</em><br><b><font color='darkred' size='5vw'>"+formatPercent(d[1]-d[0])+"</font></b>" );
		});

	bars.on("mouseout", function(d){
			div.style("display", "none");
		});

	var legend = chart1.append("g")
			.attr("transform", "translate(0, 10)")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g").data(["esercizi alberghieri", "esercizi complementari"])
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 55 + ")"; });

	legend.append("rect").attr("class", "legend-bar-rect")
		.attr("x", width)
		.attr("width", "1em")
		.attr("height", ".25em")
		.attr("fill", function(d,i){return colors(i);});

	legend.append("text").attr("class", "legend-bar-label")
		.attr("x", width)
		.attr("y", 25.5)
		.attr("dy", "0em")
		.attr("text", '')
		.append('tspan').text(function(d){ return d; })
        	.attr('x', width+60).attr('dy', '0.32em');

}

/*************CHART 2***************/
function drawAreaChart(data){
	document.getElementById("area_button").disabled = true;

	//aggiorno il dominio x1
	var domain = data[0].values.map(function(d){
		return d.Key;
	})
	x1.domain(domain);
	
	//aggiornamento dominio colore
	var domain = [],
		buisness = d3.keys(data[0].values[0]).splice(1),
		areas = data[0].values.map(function(d){return d.Key;});

	for(i in areas)
		for(j in buisness)
			domain.push(buisness[j]+'_'+areas[i]);
	
	colors.domain(domain);

	//creazione contenitore grafico 2
	var chart2 = chart.append("g").attr("id", "due");

	//rimozione grafico 1
	d3.select("#uno").remove();

	var bars = chart2.append("g").attr("id", "main")
		.selectAll("g").data(data)
		.enter().append('g').attr("class","prov")
			.attr("transform", function(d,i) { return "translate(" + x0(d.key) + ",0)"; })
		.selectAll('g').data(function(d) { return d3.stack().keys(['alberghieri', 'complementari'])(d.values)})

		.enter().append('g')
		.selectAll('.bar').data(function(d){ return d; })

		.enter().append('rect')
			.attr('class', 'bar')
			.style('fill', function(d){
				var parent = d3.select(this.parentNode).datum();
				var typeOfBuisness = parent.key;
				return colors(typeOfBuisness+"_"+d.data.Key);
			})
			.attr("x", function(d){ return x1(d.data.Key);})  
			.attr("y", function(d){ return y0(d[0]); })
			.attr("width", x1.bandwidth());

	bars.transition().delay(function (d,i){ var parent = d3.select(this.parentNode).datum(); return parent.index * 800;})
			.duration(800).ease(d3.easeLinear)
		.attr("height", function(d) { return y0(d[0]) - y0(d[1]); })
		.attr("y", function(d){ return y0(d[1]); });

	bars.on("mousemove", function(d){
			div.style("left", d3.event.pageX+10+"px");
			div.style("top", d3.event.pageY-25+"px");
			div.style("display", "inline-block");
			div.html( "<em>esercizi "+d3.select(this.parentNode).datum().key+" - da "+(d.data.Key)+"</em><br><b><font color='darkred' size='5'>"+formatPercent(d[1]-d[0])+"</font></b>" );
		});

	bars.on("mouseout", function(d){
			div.style("display", "none");
		});

	var legend = chart2.append("g")
			.attr("transform", "translate(0, 10)")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.attr("text-anchor", "end")
		.selectAll("g").data(function(){
			domain.forEach(function(d,i){
				var parts = d.split('_');
				domain[i] = "esercizi "+parts[0]+" - "+parts[1];
			});
			return domain;
		})
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 55 + ")"; });

	legend.append("rect").attr("class", "legend-bar-rect")
		.attr("x", width)
		.attr("width", "1em")
		.attr("height", ".25em")
		.attr("fill", function(d,i){return colors(i);});

	legend.append("text").attr("class", "legend-bar-label")
		.attr("x", width)
		.attr("y", 25.5)
		.attr("dy", "0em")
		.attr("text", '')
		.append('tspan').text(function(d){ 
			var words = d.split("-");
				return words[0]; 
        })
        	.attr('x', width + 60).attr('dy', '0.32em')

		.append('tspan').text(function(d){ 
			var words = d.split("-");
			return "provenienza: "+words[1]; 
        })
			.attr('x', width + 60).attr('dy', '15');

}

/***************CHART 3*****************/
function updateAreaChart(data){
	var keys = x1.domain();

	//aggiorno il dominio x1
	var domain = data[0].values.map(function(d){
		return d.Key;
	})
	x1.domain(domain);

	var flag1=0,
		flag2=0;

	var typeOfKyes = keys.some(function(d){return d==="alberghieri";}) ? "buisness" : "area";

	var chart3 = svg.selectAll('#due').select("#main").selectAll('.prov').data(data);

	var groups = chart3.selectAll("g")
		.data(function(d) { return d3.stack().keys(keys)(d.values)})

	var buisnessExitBars = [].map.call(groups.exit().selectAll(".bar")._groups, function(d){return [].map.call(d, function(d){return d})});
	if(typeOfKyes=='buisness')
		buisnessExitBars = buisnessExitBars[0].concat(buisnessExitBars[1]).concat(buisnessExitBars[2]).concat(buisnessExitBars[3]).concat(buisnessExitBars[4]);

	//exit gruppo
	groups.exit().remove();

	//enter gruppo e rect
	var newBarsBuisness = groups.enter().append("g").selectAll('.bar').data(function(d){ return d; })
		.enter().append("rect")
			.attr("class", "bar")
			.style("fill", function(d){
				var parent = d3.select(this.parentNode).datum();
				var area = parent.key;
				return colors(d.data.Key+"_"+area);
			})
	

	newBarsBuisness.on("mouseout", function(d){
			div.style("display", "none");
		});

	//update group
	var bars = groups.selectAll('.bar').data(function(d){ return d; })

	//enter rect
	var newBarsArea = bars.enter().append("rect")
		.attr('class', 'bar')
		.style('fill', function(d){
			var parent = d3.select(this.parentNode).datum();
			var typeOfBuisness = parent.key;
			return colors(typeOfBuisness+"_"+d.data.Key);
		})
		.attr("x", function(d){ 
			var x = buisnessExitBars[flag1].getAttribute('x');
			flag1 ++;
			return x;
			})
		.attr("y", 0)
		.attr("width", function(d){return buisnessExitBars[0].getAttribute('width')})
		.attr("height", function(d){ 
			var h = buisnessExitBars[flag2].getAttribute('height');
			flag2 ++;
			return h;
			})

	newBarsArea.transition().delay(1600)
			.duration(800).ease(d3.easeLinear)
		.attr("x", function(d){ return x1(d.data.Key);})  
		.attr("y", function(d){ return y0(d[1]); })
		.attr("width", x1.bandwidth())
		.attr("height", function(d) { return y0(d[0]) - y0(d[1]); });

	newBarsArea.on("mousemove", function(d){
			div.style("left", d3.event.pageX+10+"px");
			div.style("top", d3.event.pageY-25+"px");
			div.style("display", "inline-block");
			div.html( "<em>esercizi "+d3.select(this.parentNode).datum().key+" - da "+(d.data.Key)+"</em><br><b><font color='darkred' size='5'>"+formatPercent(d[1]-d[0])+"</font></b>" );
		});

	newBarsArea.on("mouseout", function(d){
			div.style("display", "none");
		});


	var areaExitBars = bars.exit()._groups,
		flag3=0,
		flag4=0;

	//exit
	bars.exit().remove()

	//update
	bars.transition().delay(function (d,i){ var parent = d3.select(this.parentNode).datum(); return parent.index * 800;})
			.duration(800).ease(d3.easeLinear)
		.style("fill", function(d){
			var parent = d3.select(this.parentNode).datum();
			if(typeOfBuisness==='buisness') {
				var area = parent.key;
				return colors(d.data.Key+"_"+area);
			}
			else {
				var typeOfBuisness = parent.key;
				return colors(typeOfBuisness+"_"+d.data.Key);
			}
		})
		.attr("width", x1.bandwidth())
		.attr("height", function(d) { return y0(d[0]) - y0(d[1]); })
		.attr("x", function(d){ return x1(d.data.Key);})  
		.attr("y", function(d){ return y0(d[1]); });

	bars.on("mousemove", null);
	bars.on("mousemove", function(d){
			div.style("left", d3.event.pageX+10+"px");
			div.style("top", d3.event.pageY-25+"px");
			div.style("display", "inline-block");
			if(typeOfKyes==='buisness') 
				div.html( "<em>esercizi "+d3.select(this.parentNode).datum().key+" - da "+(d.data.Key)+"</em><br><b><font color='darkred' size='5'>"+formatPercent(d[1]-d[0])+"</font></b>" );
			else 
				div.html( "<em>esercizi "+(d.data.Key)+" - da "+d3.select(this.parentNode).datum().key+"</em><br><b><font color='darkred' size='5'>"+formatPercent(d[1]-d[0])+"</font></b>" );
		});

	newBarsBuisness.attr("x", function(d){ return areaExitBars[0][2].getAttribute('x');})  
		.attr("y", function(d) { 
			var y = areaExitBars[flag3][2].getAttribute('y');
			flag3++;
			return y;
		})
		.attr("width", function(d){ return areaExitBars[0][2].getAttribute('width');})
		.attr("height", function(d) { 
			var h = areaExitBars[flag4][2].getAttribute('height');
			flag4++;
			return h;
		});

	newBarsBuisness.transition().delay(function (d,i){ var index = d.data.Key === 'alberghieri' ? 0 : 1; return index * 800;})
			.duration(800).ease(d3.easeLinear)
		.attr("height", function(d) { return y0(d[0]) - y0(d[1]); })
		.attr("width", x1.bandwidth())
		.attr("x", function(d){ return x1(d.data.Key);})
		.attr("y", function(d){ return y0(d[1]); });

	newBarsBuisness.on("mousemove", function(d){
			div.style("left", d3.event.pageX+10+"px");
			div.style("top", d3.event.pageY-25+"px");
			div.style("display", "inline-block");
			div.html( "<em>esercizi "+(d.data.Key)+" - da "+d3.select(this.parentNode).datum().key+"</em><br><b><font color='darkred' size='5'>"+formatPercent(d[1]-d[0])+"</font></b>" );
		});
}

function printString(words){
	var tspan = words[0];
	for(i=1; i<words.length; i++)
		tspan += " "+words[i];
	return tspan;
}

d3.csv("data/dataset_turismo.csv", function(d,i,columns){
	for (var j = 3, n = columns.length; j < n; ++j){
		d[columns[j]] = d[columns[j]].split('.').join("");
		d[columns[j]] = +d[columns[j]];
	}
	return d;
}, function(error, data) {
	if (error) throw error;

	var geo_areas = d3.map(data, function(d) {return d[data.columns[1]]; }).keys(); //regioni di provenienza

	/*devo raggruppare i miei dati per provincia di destinzione e poi per area di provenienza; quindi mi serve
	il totale degli esercizi ricettivi sia arrivi che presenze. In questo modo creo un array di 5 oggetti dove il campo 'key' 
	è la provincia; ciascuna provincia ha un campo 'values' che è un array di 3 oggetti, uno per 
	ciascuna area di provenienza; ciascuno oggetto raggruppato per area ha 2 campi: un campo key per il nome dell'area e un 
	campo value, il quale è un oggetto formato dal tot arrivi e dal tot presenze.*/
	var dataByProvince = d3.nest()
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

	/*aggiusto i dati in modo da poter creare più facilmente lo stacked*/
	var dataPercentage = dataByProvince.map(function(d){
		var newObj = {"Key": d.key, "alberghieri": (d.value["alberghi_presenze"]/d.value["tot_presenze"]), "complementari": (d.value["altro_presenze"]/d.value["tot_presenze"])};
		return newObj;
	});

	var province = dataByProvince.map(function(d){ return d.key; })
	var keys = d3.keys(dataByProvince[0].value); //prendo i nomi delle variabili quantitative
	var MAX_VALUE = d3.max(dataByProvince, function(d) {
		return d3.max(keys, function(column) { return d.value[column];});
	})

	//definisco i domini delle scale
	x0.domain(province);
	x1.domain(geo_areas).rangeRound([0, x0.bandwidth()]); //x0.bandwidth ritorna la larghezza dell'intervallo assegnato a ciascuna provincia
	y0.domain([0, 1]);

	var dataByProvinceAndArea = d3.nest()
		.key(function(d) {return d["provincia destinazione"];} )
		.key(function(d) {return d["area geografica provenienza"];} )
		.rollup(function(v) {return {
			alberghi_arrivi: d3.sum(v, function(d) {return d["esercizi alberghieri - arrivi"];}),
			alberghi_presenze: d3.sum(v, function(d) {return d["esercizi alberghieri - presenze"];}),
			altro_arrivi: d3.sum(v, function(d) {return d["esercizi complementari - arrivi"];}),
			altro_presenze: d3.sum(v, function(d) {return d["esercizi complementari - presenze"];}),
			tot_arrivi: d3.sum(v, function(d) {return d["totale esercizi ricettivi - arrivi"];}),
			tot_presenze: d3.sum(v, function(d) {return d["totale esercizi ricettivi - presenze"]})
		}; } )
		.entries(data);

	var dataPercentageArea = dataByProvinceAndArea.map(function(d){
		var provObj = {"key": d.key, "values": d.values.map(function(d){
			var newObj = {"Key":d.key, "alberghieri": (d.value["alberghi_presenze"]/d.value["tot_presenze"]), "complementari": (d.value["altro_presenze"]/d.value["tot_presenze"])};
			return newObj;
		})};
		return provObj;
	});

	var dataPercentageBuisness = dataByProvinceAndArea.map(function(d) {
		var provObj = {"key": d.key, "values": ["alberghieri", "complementari"].map(function(e){
			var buisness = e == "alberghieri" ? "alberghi_presenze" : "altro_presenze";
			var sum = d.values[0].value[buisness]+d.values[1].value[buisness]+d.values[2].value[buisness];
			var _obj = {"Key": e, "Unione Europea": d.values[0].value[buisness]/sum, "Paesi europei non UE": d.values[1].value[buisness]/sum, "Paesi extraeuropei": d.values[2].value[buisness]/sum};
			return _obj;
		} )};
		return provObj;
	})

	drawAxis();
	chart.append("text")
		.attr("class", "axis y label")
		.style("text-anchor", "middle")
		.attr("transform", "translate("+((-margin.right-30)/2)+","+ (height/2)+")rotate(-90)")
		.text("notti passate in esercizi")

	
	//setto la modal-box
	var modal_bar = d3.select('#myModal-bar'); 

	var bar_arrow = d3.select('#arrow-bar').select('span');

	var span_div = document.getElementsByClassName("close")[0];

	bar_arrow.on("click", function(){
		modal_bar.style("display", "block");
		drawOverallChart(dataPercentage);
	});

	span_div.onclick = function() {
	    modal_bar.style("display", "none");
	    d3.select("#uno").remove();
	    d3.select("#due").remove();
	}

	window.onclick = function(event) {
	    if (event.target == modal_bar) {
	       	modal_bar.style("display", "none");
	    }
	}

	//drawOverallChart(dataPercentage);
    
	d3.selectAll(".checkBox").on("change", change);
	
	function change(){
		if(this.value === 'complessivo') {
			drawOverallChart(dataPercentage);
			document.getElementById("buttons").hidden = true;
		}
		else if(this.value === 'area') {
			drawAreaChart(dataPercentageArea); 
			d3.selectAll(".btn").on('click', update);
			document.getElementById("buttons").hidden = false;
		}
	}

	function update(){
		if(this.value == 'Tipo di Esercizi') {
			updateAreaChart(dataPercentageBuisness);
			d3.selectAll("#buisness_button").attr("disabled", true);
			document.getElementById("area_button").disabled = false;
		}
		else if(this.value == 'Area Geografica') {
			updateAreaChart(dataPercentageArea);
			document.getElementById("buisness_button").disabled = false;
			d3.selectAll("#area_button").attr("disabled", true);
		}
	}	

});

