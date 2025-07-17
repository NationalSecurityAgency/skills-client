/*
Copyright 2025 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package skills.datasets

import com.xlson.groovycsv.CsvParser
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import groovy.transform.ToString

import java.text.SimpleDateFormat

class TransformDataset {

    static void main(String[] args) {
        new TransformDataset().transform()
    }

    File inputFile = new File("/home/dimay/dev/tmp/movies_metadata.csv")
    File outputFile = new File("/home/dimay/dev/tmp/movies.json")

    @ToString(includeNames = true)
    static class Movie {
        String id
        String title
        String overview
        List<String> genres
        // optional
        String collectionName
        Double popularity
        Date releaseDate
        Long revenue
        Double runtime
        String tagline

        Integer voteCount
        Double voteAverage

        String homePage
    }

    static class Subject {
        String id
        String name
        String iconClass
        List<Movie> movies
    }

    static class Project {
        String id
        String name
        List<Subject> subjects
        List<Badge> badges
    }

    static class Badge {
        String id
        String name
        String description
        String iconClass
        List<String> skillIds
    }

    Map<String, String> idToIcon = [
            PiratesoftheCaribbeanCollection: "fas fa-skull-crossbones",
            StarWarsCollection: "fab fa-jedi-order",
            TheTerminatorCollection: "fas fa-robot",
            TheHungerGamesCollection: "fas fa-bullseye",
            HarryPotterCollection: "fas fa-quidditch",
            DespicableMeCollection: "fas fa-carrot",
            TheTwilightCollection: "fas fa-ghost",
            AlienCollection: "fab fa-reddit-alien"
    ]

    void transform() {

        List<Movie> movies = loadMovies()
        movies = movies.sort({ it.popularity }).reverse()

        println movies.collect { it.genres }.flatten()

        movies.groupBy { it.collectionName }.each {
            if (it.value.size() > 4) {
                println "${it.key} => ${it.value.size()}"
            }
        }

        List<Subject> subjects = [
                new Subject(name: "Action", iconClass: "fas fa-running"),
                new Subject(name: "Comedy", iconClass: "far fa-laugh-squint"),
                new Subject(name: "Drama", iconClass: "fas fa-heart-broken"),
                new Subject(name: "Family", iconClass: "fas fa-user-friends"),
                new Subject(name: "Science Fiction", iconClass: "fas fa-jedi"),
                new Subject(name: "History", iconClass: "fas fa-monument"),
        ]

        Set<String> alreadyAddedTitles = new HashSet<>()
        int aboutNumSkillsPerSubject = 40
        subjects.each { Subject subject ->
            subject.id = createId(subject.name)
            int num = new Random().nextInt(20) - 10
            subject.movies = movies.findAll {
                it.genres.contains(subject.name) &&
                        !alreadyAddedTitles.contains(it.title) &&
                        createId(it.title).size() >= 3
            }.subList(0, aboutNumSkillsPerSubject - num)
            subject.movies.each {
                alreadyAddedTitles.add(it.title)
            }
        }


        subjects.each {
            println "-------------------------"
            println "${it.name} => ${it.movies.size()}"
//            println "-------------------------"
//            it.movies.each {
//                println "   ${it.title}"
//            }

        }

        String projName = "Movies"
        Project project = new Project(subjects: subjects, name: projName, id: projName.toLowerCase())

        List<Badge> badges = []
        project.subjects.collect { it.movies }.flatten().findAll({ it.collectionName }).groupBy { it.collectionName }.each {
            if (it.value.size() > 3) {
                List<Movie> collectionMovies = it.value
//                println "${it.key} => ${it.value.size()}"
                Badge badge = new Badge(name: it.key, id: createId(it.key),
                        skillIds: collectionMovies.collect { it.id }.unique(),
                )
                badge.iconClass = idToIcon.get(badge.id)
                badges.add(badge)
            }
        }
        project.badges = badges
//        project.subjects.collect { it.movies }.flatten().collect { it.genres }.flatten().unique().each {println it}


        String json = JsonOutput.prettyPrint(JsonOutput.toJson(project))
        outputFile.delete()
        outputFile.write(json)
//        Set<String> genres = new HashSet<>()
//        movies.each {
//            genres.addAll(it.genres)
//        }
//        println genres
    }

    private String createId(String name) {
        return name.replaceAll("[^0-9a-zA-Z]+", "");
    }

    private List<Movie> loadMovies() {
        List<Movie> res = []
        def jsonSlurper = new JsonSlurper()
        def data = CsvParser.parseCsv(inputFile.newReader())
        loop:
        for (line in data) {
            try {
                line.title
            } catch (Throwable t) {
                continue loop
            }
            if (line) {
                Boolean isAdult = Boolean.valueOf(line.adult)
                if (line.title && !isAdult && line.release_date) {
                    def parsedGenre = jsonSlurper.parseText(line.genres.replaceAll("'", "\""))
                    List<String> genres = parsedGenre.collect { it.name }
                    Movie movie = new Movie(
                            id: createId(line.title),
                            title: line.title, overview: line.overview, genres: genres,
                            popularity: Double.parseDouble(line.popularity),
                    )

                    if (line."belongs_to_collection") {
                        movie.collectionName = line."belongs_to_collection".toString().replaceAll("'", "\"").split("\"name\": \"")[1].split("\"")[0].replaceAll("\"", "'")
                    }

                    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd")
                    movie.releaseDate = format.parse(line.release_date)
                    if (line.revenue) {
                        movie.revenue = Long.parseLong(line.revenue)
                    }
                    if (line.runtime) {
                        movie.runtime = Double.parseDouble(line.runtime)
                    }
                    if (line.tagline) {
                        movie.tagline = line.tagline
                    }
                    if (line.vote_average) {
                        movie.voteAverage = Double.parseDouble(line.vote_average)
                    }
                    if (line.vote_count) {
                        movie.voteCount = Integer.parseInt(line.vote_count)
                    }

                    movie.homePage = line.homepage
                    res << movie
                }
            }
        }

        return res
    }
}
