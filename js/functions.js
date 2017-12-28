
function dateParse(format){
	return d3.timeParse(format)
}
// set the dimensions and margins of the graph
function line (id,titleDiv,d){
	var margin = {top: 20, right: 20, bottom: 105, left: 50},
		width  = 750 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;
		
	// parse the date / time
	//var parseTime = d3.timeParse("%d-%b-%y");
	// set the ranges
	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);
	var z = d3.scaleOrdinal(d3.schemeCategory10);
	
	// define the line
	var valueline = d3.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.close); });
	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var div = d3.select("#row-1")
			  .append("div")
			  .attr("class", "col-sm-6 borderDiv")

	var title = div.append("h2")
				  .text(titleDiv);
	
	var svg = div.append("svg")
		.attr("width", "100%")
		 .attr("height", "400")
	  .append("g")
		.attr("transform",
			  "translate(" + margin.left + "," + margin.top + ")");
			  
	// Get the data
	/*d3.csv("data.csv", function(error, data) {
	  if (error) throw error;
	  // format the data
	  data.forEach(function(d) {
		  d.date = parseTime(d.date);
		  d.close = +d.close;
	  });*/
	  // Scale the range of the data
	  
	var parseTime = dateParse("%Y-%m-%d");
	d3.json('data/data.json',function(error, data){
		var group = groupBy(data,['date']);
		group.forEach(function(d) {
		  d.date = parseTime(d.value);
		  d.close = +d.count.count//+d.close;
		});
		group.sort(function(x, y){        
			return y.date - x.date;
		})
		x.domain(d3.extent(data, function(d) { return d.date; }));
		  y.domain([0, d3.max(data, function(d) { return d.close; })]);
		  // Add the valueline path.
		  svg.append("path")
			  .data([data])
			  .attr("class", "line")
			  //.style("stroke", function(d) { return z('teste'); })
			  .attr("d", valueline)
			  
			  
		  // Add the X Axis
		  svg.append("g")
			  .attr("transform", "translate(0," + height + ")")
			  .call(d3.axisBottom(x));
		  // Add the Y Axis
		  svg.append("g")
			  .call(d3.axisLeft(y));
	});
}

function barGraph(id,titleDiv,data,horizontal){
	
	var div = d3.selectAll(id)
			  .append("div")
			  .attr("class", "col-sm-6 borderDiv")
			  .style("height", "300px");

	var margin = {top: 20, right: 20, bottom: 105, left: 50},
		width  = 550 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;
	
	var margin = {top: 20, right: 20, bottom: 105, left: 50},
		width  = 350 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;
		
	
	var color = d3.scaleOrdinal().range([d3.schemeCategory10]);
	
	var colorRange = d3.scaleOrdinal(d3.schemeCategory10);
	var color = d3.scaleQuantize()
		.domain([0, 1])
		.range(["brown", "steelblue"]);
		
	var z = d3.scaleLinear()
			//.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
			.range(["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"])
			.domain([0,0.2,0.4,0.6,0.8])
			
	var title = div.append("h2")
				  .text(titleDiv);
	
	// IF PARA MONTAR O GRÁFICO HORIZONTAL OU VERTICAL 	
	if(horizontal){
		var margin = {top: 20, right: 20, bottom: 105, left: 70};
		var x = d3.scaleLinear().range([0, width]);
		var y = d3.scaleBand().range([height, 0]);	
		
		x.domain([0, d3.max(data, function(d) { return d.count; })]);
		y.domain(data.map(function(d) { return d.value; })).padding(0.1);		
	}else{
		var x = d3.scaleBand().range([0, width]).padding(.5),	
			y = d3.scaleLinear().rangeRound([height, 0]);
			
		x.domain(data.map(function(d) { return d.value; }));
		y.domain([0, d3.max(data, function(d) { return d.count; })]);
	
	}
	
	var svg = div.append("svg")
			 .attr("width", "100%")
			 .attr("height", "100%")
			
	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left  + "," + margin.top + ")");

	g.append("g")
	  .attr("class", "axis axis--x")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x))
	  
	if(horizontal){
		g.selectAll("text")
		  .style("text-anchor", "end")
		  .style("font-size", "11px")
		  .attr("dx", "-.8em")
		  .attr("dy", "-.55em")
		  .attr("transform", "rotate(-90)" );
	}

	g.append("g")
	  .attr("class", "axis axis--y")
	  .call(d3.axisLeft(y).ticks(10,"s"))	  
	.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .attr("text-anchor", "end")
	  

	var bar = g.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			  .attr("class", "bar")
			  
		  
	  
	if(horizontal) { 
		bar = bar
			.attr("x", 0 )
			.attr("y", function(d){ return y(d.value); })
			.attr("height", y.bandwidth())
			.attr("width", function(d) { return x(d.count); })
		
	}else{
	  bar = bar
		  .attr("x", function(d) { return x(d.value); })
		  .attr("y", function(d) { return y(d.count); })
		  .attr("height", function(d) { return height - y(d.count); })	
		  .attr("width", x.bandwidth() )
		  //.style("fill", function(d) {return color(d.value)});
	}
	
	
	bar.on("mousemove", function(d){
		tooltip
		  .style("left", d3.event.pageX - 50 + "px")
		  .style("top", d3.event.pageY - 70 + "px")
		  .style("display", "inline-block")
		  .html((d.value) + "<br>" + (d.count.toLocaleString('de-DE')));
	})
    .on("mouseout", function(d){ tooltip.style("display", "none");});	
}
// FUNÇÃO PARA RETORNAR UMA FUNÇÃO COM PROPERTYNAME.
// UTILIZADA PARA CRIAR O GROUPBY DINAMICAMENTE
function createNestingFunction(propertyName){
	return function(d){ 
    	return d[propertyName];
    };
}

function groupBy(dados,levels){
	// CRIANDO OBJETO DO TIPO 'nest()'
	var nest = d3.nest();

	//LOOP PARA CRIAR AS 'KEYs' DINAMICAMENTE PARA O GROUPBY
	for (var i = 0; i < levels.length; i++) {        
        nest = nest.key( createNestingFunction(levels[i]) );        
	}
	//var groupBy = nest.rollup(function(v) { return v.length; }).entries(dados);
	var groupBy = nest.rollup(function(v) { return {
			count: v.length,
			sumSal: d3.sum(v, function(d) { return d.salary; }),
			meanSal: d3.mean(v, function(d) { return d.salary; }),
			minSal: d3.min(v, function(d) { return d.salary; }),
			maxSal: d3.max(v, function(d) { return d.salary; }),
			minRate: d3.min(v, function(d) { return d.rating; }),
			maxRate: d3.max(v, function(d) { return d.rating; }),
			meanRate: d3.mean(v, function(d) { return d.rating; })
		
		}; }).entries(dados);

	
	groupBy = JSON.parse(JSON.stringify(groupBy).split('"value":').join('"count":'));//ALTERAR NOME DOS ATRIBUTOS DO JSON
	groupBy = JSON.parse(JSON.stringify(groupBy).split('"key":').join('"value":')); //ALTERAR NOME DOS ATRIBUTOS DO JSON

    return groupBy;
}

function readCSV(file){
	var retorno = [];	
	d3.csv(file,function(error, data){
		data.map(function(x){
			retorno.push({data})
		});
	});
	return retorno;
}



/**********************************************************************
**********************************************************************
***************************************************************************/
// FUNÇÃO PARA MONTAR MULTISELECT COM PLUGIN 'multiSelect Jquery'
function montaSearchble(){
  $('.searchable').multiSelect({    
    selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='Select Country'>",
    selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='Exclude Country'>",
    afterInit: function(ms){
      var that = this,
          $selectableSearch = that.$selectableUl.prev(),
          $selectionSearch = that.$selectionUl.prev(),
          selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
          selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';
      
      that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
      .on('keydown', function(e){
        if (e.which === 40){
          that.$selectableUl.focus();
          return false;          
        }
      });

      that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
      .on('keydown', function(e){
        if (e.which == 40){          
          that.$selectionUl.focus();
          return false;
        }
      });
    },
    afterSelect: function(){
		this.qs1.cache();
		this.qs2.cache();

		var qtdSelec = $('.ms-selection').find('.ms-list > .ms-elem-selection.ms-selected');

		d3.selectAll("#charts > div > .col-sm-6").remove();
		$('#infos > div').remove();
		
		if(qtdSelec.length == limitSelec){
			$('.ms-selectable').find("*").prop('disabled', true);
			alert('Limite de insituiçãoes é de ' + limitSelec )
		}
		var countrySelec = []
		for( var i =0; i <  qtdSelec.length; i++){
			// PEGANDO O PAI SELECIONADO
			countrySelec.push( $(qtdSelec[i]).text());
		}
		barCharts(countrySelec)
    },
    afterDeselect: function(){
		this.qs1.cache();
		this.qs2.cache();
		var qtdSelec = $('.ms-selection').find('.ms-list > .ms-elem-selection.ms-selected')

		d3.selectAll("#charts > div >.col-sm-6").remove();
		$('#infos > div').remove();
		
		if(qtdSelec.length <limitSelec){
			$('.ms-selectable').find("*").prop('disabled', '');
		}            
		var countrySelec = []
		if(qtdSelec.length > 0){
			
			for( var i =0; i <  qtdSelec.length; i++){
				// PEGANDO O PAI SELECIONADO
				countrySelec.push( $(qtdSelec[i]).text());
			}
			barCharts(countrySelec)
		}else{
			d3.selectAll("#charts > div >.col-sm-6").remove();
			$('#infos > div').remove();
		}
    }
  });
}

// MONTA COMBO DAS INSITITUIÇÕES DA BASE
function montaCombo (dados,field, id){
	var dados = d3.nest()
					.key(function(d) {return d[field];})
					.entries(dados)

	dados.sort(function(x, y){
		return d3.ascending(x.key, y.key);
	})

	$.each(dados, function(x,y){
	  $(id).append($('<option>',{
		value: y.key,
		text: y.key
	  }))      
	})    
	montaSearchble();
	$('.ms-list').css("height",'125px');
	$('.ms-container').addClass('col-sm-6');
}

function smallChart(id, data){
	var margin = {top: 45, right: 100, bottom: 20, left: 20},
		width = 450 - margin.left - margin.right,
		height = 90 - margin.top - margin.bottom;

	var x = d3.scaleBand().range([0, width]).padding(.1);
	
	var y = d3.scaleLinear()
		.range([height, 0]);
	
	var rating = []
	data.map(function(x){
			rating.push(x.count.maxRate);
			rating.push(x.count.meanRate);
			rating.push(x.count.minRate);	
	})
	var newData = []
	
	data.map(function(x){
		for(line in x.count){
			if(['maxRate','meanRate','minRate'].includes(line)){ 
				newData.push({company: x.value, type: line, value: x.count[line] })
			}
		}
	})
	newData.sort(function(x,y){
		return x.value - y.value;
	})
	var countries = d3.nest()
					.key(function(d) { return d.company; })
					.entries(newData);
	
	x.domain(newData.map(function(d) { return d.type; }));
	y.domain([0, d3.max(rating)]);
	
	// Add an SVG element for each country, with the desired dimensions and margin.
	var svg = d3.select(id)
				.append('div').attr('class','col-sm-7 borderDiv')
				.selectAll("svg")
				.data(countries)
				.enter()
				.append("svg:svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))

	svg.append("g")
		.append("text")
		.attr("x", width + 10)
		.attr("y", height/3)
		.attr("dy", ".71em")
		.attr("text-anchor", "start")
		.attr("font-size", "1.1em")
		.text(function(d) {  return d.key});

	var extent = d3.min(newData,function(x){  return x.value; })

	svg.selectAll(".bar")
		.data(function(d) {  return d.values }) 
		.enter()
		.append("rect")
		.attr("class", function(d){
			return d.type + " bar"
		})
		.attr("x", function(d) { return x(d.type); })
		.attr("width", x.bandwidth())
		.attr("y", function(d) {  return y(d.value); })
		.attr("height", function(d) { return height - y(d.value); })		
		.on("mousemove", function(d){
			tooltip
			  .style("left", d3.event.pageX - 50 + "px")
			  .style("top", d3.event.pageY - 70 + "px")
			  .style("display", "inline-block")
			  //.html("</strong><br/><span style=\'color:#fff\'>" + (d.percent*100) + "%</span>")
			  .html( (d.type) + '<br>' + (parseFloat(Math.round(d.value * 100) / 100).toFixed(2)) )
		})
		.on("mouseout", function(d){ tooltip.style("display", "none");});
}