//FUNCTION TO MAKE BARCHARTS
function barCharts(countrySelect){
	d3.json('data/data.json',function(error, data){
		if(error) throw error;
		data.forEach(function(d) {
			d.salary = +d.salary;
		});
		data = data.filter(function(d) { return countrySelect.includes(d.country) })
		
		var groupSkill = []
		var dataNest = d3.nest()
			.key(function(d) {return d.country;})
			.entries(data);
			
		dataNest.map(function(x){
			x.values.map(function(d){
				var skill = d.skillclean.split(',');
				skill.forEach(function(row){
					//console.log(row)
					groupSkill.push({key:x.key, skill: row.trim()})
				})
			})
		})
		
		var groupS = groupBy(groupSkill, ['key','skill'])
		
		groupS.map(function(x){
			x.values = x.values.filter(function(filtro){ return filtro.value != ""})
			
			var countSkill = x.values.map(function(row){
				//console.log(row)
				//return {value: row.value}
				//row = row.filter(function(filtro) { return filtro.value != ""});
				return {value: row.value,count: row.count.count}
			})
			countSkill.sort(function(x,y){
				return y.count - x.count
			})
			countSkill = countSkill.slice(0,10)
			countSkill.sort(function(x,y){
				return x.count - y.count
			})
			barGraph('#skills','Top skills ' + x.value, countSkill, true)
		})
		
		/************* GROUPBY BY COUNTRY **************/
		var group = groupBy(data,['country']);
		// BAR CHART OF COUNT OF THE QUANTITY OF JOBS VACANCIES BY COUNTRY
		countJobs = group.map(function(x){
			return {value: x.value, count: x.count.count}
		})
		countJobs.sort(function(x, y){        
			return y.count - x.count;
		})			
		countJobs = countJobs.slice(0,10);
		barGraph('#jobs','Jobs Vacancies by Country',countJobs,false);
		
		// BAR CHART OF AVARAGE OF THE SALARY BY COUNTRY
		meanSal = group.map(function(x){
			return {value: x.value, count: x.count.meanSal}
		})
		meanSal.sort(function(x, y){        
			return y.count - x.count;
		})
		
		barGraph('#jobs','Average Salary by Country',meanSal,false);
		
		// INSERTING INFOS IN TEXT
		group.forEach(function(i,e){
			var text = i.value + ', min Salary = $' + i.count.minSal.toLocaleString('de-DE') + 
						', max salary = $' + i.count.maxSal.toLocaleString('de-DE') + ' by year'; 
			var info = d3.selectAll('#infos')
						.append("div")
						.text(text)
						.style('color',color[e])
						.style('margin','2px')
						.style('font-size', '18px');
			
		})
	});
}


//FUNCTION TO MAKE CHARTS ABOUT COMPANIES RATING
function compRating(countrySelect){
	//var parseTime = dateParse("%d %b %Y");
	var parseTime = dateParse("%Y-%m-%d")
	d3.json('data/review.json',function(error, data){
		if(error) throw error;
		//data = data.filter(function(d) { return countrySelect.includes(d.company) })
		data.forEach(function(d) {
			d.rating = +d.rating;
			d.dateFull = parseTime(d.dateFull)
		});
		
		countAvalible = groupBy(data,['company'])
		smallChart('#vis > .row', countAvalible);
		
		var countRecommends = groupBy(data,['company','recomends'])
			
		countRecommends.map(function(x){
			x.values = x.values.filter(function(filtro){ return filtro.value != ""})
			
			var countRec = x.values.map(function(row){
				return {value: row.value,count: row.count.count}
			})
			countRec.sort(function(x,y){
				return y.count - x.count
			})
			countRec.sort(function(x,y){
				return x.count - y.count
			})
			barGraph('#vis','Recommendation for ' +  x.value,countRec,false);
		})
		
		var negComments = []
		var posComments = []
		var dataNest = d3.nest()
						.key(function(d) {return d.company;})
						.entries(data);
			
		dataNest.map(function(x){
			x.values.map(function(d){
				var prosComments = d.prosClean.split(' ');
				
				prosComments.forEach(function(row){
					posComments.push({key:x.key, comments: row.trim()})
				})
				var consComments = d.consClean.split(' ');
				consComments.forEach(function(row){
					negComments.push({key:x.key, comments: row.trim()})
				})
			})
		})
		
		
		var groupS = groupBy(posComments, ['key','comments']);
		
		groupS.map(function(x){
			x.values = x.values.filter(function(filtro){ return filtro.value != ""})
			
			var countWord = x.values.map(function(row){
				return {value: row.value,count: row.count.count}
			})
			countWord.sort(function(x,y){
				return y.count - x.count
			})
			countWord = countWord.slice(0,10)
			countWord.sort(function(x,y){
				return x.count - y.count
			})
			
			barGraph('#poscoment','Pos comments ' + x.value, countWord, true)
		})
		
		var groupS = groupBy(negComments, ['key','comments'])
		groupS.map(function(x){
			x.values = x.values.filter(function(filtro){ return filtro.value != ""})
			
			var countWord = x.values.map(function(row){
				return {value: row.value,count: row.count.count}
			})
			countWord.sort(function(x,y){
				return y.count - x.count
			})
			countWord = countWord.slice(0,10)
			countWord.sort(function(x,y){
				return x.count - y.count
			})
			barGraph('#negcoment','Neg comments ' + x.value, countWord, true)
		})
		
	});
}