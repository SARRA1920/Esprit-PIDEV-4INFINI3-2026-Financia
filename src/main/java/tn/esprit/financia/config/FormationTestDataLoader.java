package tn.esprit.financia.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.formation.Course;
import tn.esprit.financia.entities.formation.Lesson;
import tn.esprit.financia.entities.formation.LessonContent;
import tn.esprit.financia.entities.formation.LessonType;
import tn.esprit.financia.repository.formation.CourseRepository;

import java.util.ArrayList;
import java.util.List;

/**
 * Insère des cours / leçons de démonstration lorsque la base formation est vide (tests UI Angular).
 */
@Component
@Order(100)
@Slf4j
public class FormationTestDataLoader implements CommandLineRunner {

    private final CourseRepository courseRepository;

    @Value("${app.formation.seed-demo-data:true}")
    private boolean seedDemoData;

    public FormationTestDataLoader(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            log.debug("FormationTestDataLoader: désactivé (app.formation.seed-demo-data=false).");
            return;
        }
        if (courseRepository.count() > 0) {
            log.debug("FormationTestDataLoader: données déjà présentes ({} cours), aucun seed.", courseRepository.count());
            return;
        }

        courseRepository.saveAll(List.of(buildCourseFinance(), buildCourseCredit()));
        log.info("FormationTestDataLoader: 2 parcours de démonstration et leçons associées ont été créés.");
    }

    private Course buildCourseFinance() {
        Course course = new Course();
        course.setTitle("Introduction à la finance personnelle");
        course.setDescription(
                "Comprendre les bases : budget, épargne et lecture des indicateurs utiles avant un projet de crédit.");

        Lesson l1 = new Lesson();
        l1.setTitle("Pourquoi budgétiser ?");
        l1.setType(LessonType.TEXT);
        l1.setOrderIndex(1);
        l1.setCourse(course);
        LessonContent c1 = new LessonContent();
        c1.setLesson(l1);
        c1.setTextContent(
                "Un budget simple permet de voir ce qui entre et ce qui sort chaque mois. "
                        + "Commencez par lister vos revenus fixes, puis vos charges récurrentes (loyer, assurances). "
                        + "Le reste donne une vision claire de votre capacité d’épargne ou de remboursement.");
        c1.setTextFrench(c1.getTextContent());
        l1.setContent(c1);

        Lesson l2 = new Lesson();
        l2.setTitle("Taux, capital et durée");
        l2.setType(LessonType.TEXT);
        l2.setOrderIndex(2);
        l2.setCourse(course);
        LessonContent c2 = new LessonContent();
        c2.setLesson(l2);
        c2.setTextContent(
                "Le coût total d’un crédit dépend du montant emprunté, du taux annuel et de la durée. "
                        + "Plus la durée est longue, plus les intérêts cumulés augmentent : comparez toujours plusieurs scénarios.");
        l2.setContent(c2);

        List<Lesson> lessons = new ArrayList<>();
        lessons.add(l1);
        lessons.add(l2);
        course.setLessons(lessons);
        return course;
    }

    private Course buildCourseCredit() {
        Course course = new Course();
        course.setTitle("Bien préparer une demande de crédit");
        course.setDescription(
                "Les éléments que Financia analyse : revenus, stabilité, capacité de remboursement et risque.");

        Lesson l1 = new Lesson();
        l1.setTitle("Documents et sincérité des informations");
        l1.setType(LessonType.TEXT);
        l1.setOrderIndex(1);
        l1.setCourse(course);
        LessonContent c1 = new LessonContent();
        c1.setLesson(l1);
        c1.setTextContent(
                "Préparez vos justificatifs de revenus et gardez vos données à jour. "
                        + "Une demande cohérente accélère l’instruction et améliore le score de risque.");
        l1.setContent(c1);

        Lesson l2 = new Lesson();
        l2.setTitle("Auto-évaluation rapide");
        l2.setType(LessonType.QUIZ);
        l2.setOrderIndex(2);
        l2.setCourse(course);
        LessonContent c2 = new LessonContent();
        c2.setLesson(l2);
        c2.setTextContent("Répondez aux questions suivantes pour valider vos acquis sur le parcours crédit.");
        c2.setQuizJson(
                "{\"questions\":[{\"id\":0,\"text\":\"Le DTI compare…\",\"options\":[\"Les charges au revenu\",\"Le taux au capital\",\"La durée au montant\"],\"answer\":0}]}");
        l2.setContent(c2);

        List<Lesson> lessons = new ArrayList<>();
        lessons.add(l1);
        lessons.add(l2);
        course.setLessons(lessons);
        return course;
    }
}
