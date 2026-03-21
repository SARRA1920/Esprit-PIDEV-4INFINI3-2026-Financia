package tn.fiancia.financia.ai;

import lombok.AllArgsConstructor;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.queries.mlt.MoreLikeThis;
import org.apache.lucene.index.Term;
import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.springframework.stereotype.Service;
import tn.fiancia.financia.entities.Course;
import tn.fiancia.financia.repositories.CourseRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final CourseRepository courseRepository;

    @Override
    public List<Course> recommendForCourse(long idCourse, int limit) {
        List<Course> all = new ArrayList<>();
        courseRepository.findAll().forEach(all::add);

        Optional<Course> targetOpt = all.stream().filter(c -> c.getIdCourse() == idCourse).findFirst();
        if (targetOpt.isEmpty()) return List.of();

        // Build an in-memory Lucene index
        try (ByteBuffersDirectory dir = new ByteBuffersDirectory()) {
            Analyzer analyzer = new StandardAnalyzer();
            IndexWriterConfig iwc = new IndexWriterConfig(analyzer);
            try (IndexWriter writer = new IndexWriter(dir, iwc)) {
                for (Course c : all) {
                    String content = (c.getTitle() == null ? "" : c.getTitle()) + " " + (c.getDescription() == null ? "" : c.getDescription());
                    Document doc = new Document();
                    doc.add(new StringField("id", String.valueOf(c.getIdCourse()), Field.Store.YES));
                    doc.add(new TextField("content", content, Field.Store.NO));
                    writer.addDocument(doc);
                }
            }

            try (DirectoryReader reader = DirectoryReader.open(dir)) {
                IndexSearcher searcher = new IndexSearcher(reader);

                // Find target Course and its text content
                Course targetCourse = all.stream().filter(c -> c.getIdCourse() == idCourse).findFirst().orElse(null);
                if (targetCourse == null) return List.of();
                String targetContent = (targetCourse.getTitle() == null ? "" : targetCourse.getTitle()) + " " + (targetCourse.getDescription() == null ? "" : targetCourse.getDescription());

                MoreLikeThis mlt = new MoreLikeThis(reader);
                mlt.setAnalyzer(analyzer);
                mlt.setFieldNames(new String[]{"content"});
                mlt.setMinTermFreq(1);
                mlt.setMinDocFreq(1);

                org.apache.lucene.search.Query query = mlt.like("content", new java.io.StringReader(targetContent));
                TopDocs top = searcher.search(query, limit + 1);

                List<Long> ids = new ArrayList<>();
                for (ScoreDoc sd : top.scoreDocs) {
                    Document d = reader.document(sd.doc);
                    String id = d.get("id");
                    if (id != null && !id.equals(String.valueOf(idCourse))) {
                        try { ids.add(Long.parseLong(id)); } catch (NumberFormatException ex) { }
                    }
                }

                // Fallback: if MoreLikeThis returned no results, do a simple boolean-term search using tokens from target
                if (ids.isEmpty()) {
                    String[] tokens = targetContent.toLowerCase().split("\\W+");
                    BooleanQuery.Builder qb = new BooleanQuery.Builder();
                    int added = 0;
                    for (String tk : tokens) {
                        if (tk == null) continue;
                        tk = tk.trim();
                        if (tk.length() < 3) continue;
                        qb.add(new BooleanClause(new TermQuery(new Term("content", tk)), BooleanClause.Occur.SHOULD));
                        if (++added >= 20) break;
                    }
                    TopDocs top2 = searcher.search(qb.build(), limit + 1);
                    for (ScoreDoc sd : top2.scoreDocs) {
                        Document d = reader.document(sd.doc);
                        String id = d.get("id");
                        if (id != null && !id.equals(String.valueOf(idCourse))) {
                            try { ids.add(Long.parseLong(id)); } catch (NumberFormatException ex) { }
                        }
                    }
                }

                return ids.stream()
                        .map(id -> all.stream().filter(c -> c.getIdCourse() == id).findFirst().orElse(null))
                        .filter(c -> c != null)
                        .collect(Collectors.toList());
            }
        } catch (IOException e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
