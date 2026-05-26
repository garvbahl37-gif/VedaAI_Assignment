'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { GeneratedPaper } from '@vedaai/shared';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1A1A1A',
    lineHeight: 1.4,
  },
  header: { textAlign: 'center', marginBottom: 10 },
  schoolName: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  subject: { fontSize: 12, marginTop: 4 },
  className: { fontSize: 10, color: '#6B7280' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique', color: '#6B7280', fontSize: 9 },
  studentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, fontSize: 10 },
  studentField: { width: '32%' },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginTop: 14 },
  sectionSub: { fontSize: 10, color: '#6B7280', marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  question: { flexDirection: 'row', marginBottom: 6, fontSize: 10 },
  qNum: { width: 16, fontFamily: 'Helvetica-Bold' },
  qBody: { flex: 1, paddingRight: 6 },
  qMarks: { width: 60, textAlign: 'right', fontSize: 9, color: '#6B7280' },
  difficulty: { fontSize: 8, marginTop: 2, color: '#6B7280' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, fontSize: 9, color: '#374151' },
  option: { width: '50%', paddingRight: 8, marginTop: 1 },
  answerKey: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  answerKeyTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  answerLine: { fontSize: 9, marginBottom: 2 },
});

export function PaperPdfDocument({ paper }: { paper: GeneratedPaper }) {
  return (
    <Document title={`${paper.subject} - ${paper.className}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>{paper.schoolName}</Text>
          <Text style={styles.subject}>{paper.subject}</Text>
          <Text style={styles.className}>{paper.className}</Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.bold}>Time Allowed: </Text>
            {paper.timeAllowed}
          </Text>
          <Text>
            <Text style={styles.bold}>Maximum Marks: </Text>
            {paper.maximumMarks}
          </Text>
        </View>

        {paper.generalInstructions && paper.generalInstructions.length > 0 && (
          <View style={{ marginTop: 6 }}>
            {paper.generalInstructions.map((line, i) => (
              <Text key={i} style={styles.italic}>
                • {line}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.studentRow}>
          <Text style={styles.studentField}>Name: ____________________</Text>
          <Text style={styles.studentField}>Roll No.: __________________</Text>
          <Text style={styles.studentField}>Section: ___________________</Text>
        </View>

        <View style={styles.divider} />

        {paper.sections.map((section) => (
          <View key={section.label} wrap={false}>
            <Text style={styles.sectionTitle}>{section.label}</Text>
            <View style={styles.sectionSub}>
              <Text>{section.title}</Text>
              <Text style={styles.italic}>({section.instruction})</Text>
            </View>

            {section.questions.map((q) => (
              <View key={`${section.label}-${q.number}`} style={styles.question}>
                <Text style={styles.qNum}>{q.number}.</Text>
                <View style={styles.qBody}>
                  <Text>{q.text}</Text>
                  {q.options && q.options.length > 0 && (
                    <View style={styles.optionRow}>
                      {q.options.map((opt, i) => (
                        <Text key={i} style={styles.option}>
                          {opt}
                        </Text>
                      ))}
                    </View>
                  )}
                  <Text style={styles.difficulty}>Difficulty: {q.difficulty}</Text>
                </View>
                <Text style={styles.qMarks}>
                  [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.answerKey} break>
          <Text style={styles.answerKeyTitle}>Answer Key</Text>
          {paper.sections.map((section) => (
            <View key={`ak-${section.label}`} style={{ marginBottom: 8 }}>
              <Text style={styles.bold}>
                {section.label} — {section.title}
              </Text>
              {section.questions.map((q) => (
                <Text key={`ak-${section.label}-${q.number}`} style={styles.answerLine}>
                  {q.number}. {q.answer ?? '—'}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
