'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { GeneratedPaper } from '@vedaai/shared';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1A1A1A',
    lineHeight: 1.45,
  },

  // ── Header ───────────────────────────────────────────
  header: { textAlign: 'center', marginBottom: 14 },
  schoolName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  subject: {
    fontSize: 12.5,
    marginTop: 6,
    color: '#1A1A1A',
  },
  className: {
    fontSize: 10.5,
    marginTop: 4,
    color: '#6B7280',
  },

  // ── Time + Marks row ─────────────────────────────────
  timeMarksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    fontSize: 11,
  },
  bold: { fontFamily: 'Helvetica-Bold' },

  // ── General instructions ─────────────────────────────
  instructions: { marginTop: 10 },
  instructionLine: {
    fontFamily: 'Helvetica-Oblique',
    color: '#6B7280',
    fontSize: 10,
    marginBottom: 3,
  },

  // ── Student info row (Name / Roll / Section) ─────────
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    fontSize: 11,
  },
  studentField: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  studentLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginRight: 4,
  },
  studentBlank: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    width: 130,
    height: 12,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 14,
    marginBottom: 12,
  },

  // ── Sections + questions ─────────────────────────────
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },
  sectionInstruction: {
    fontFamily: 'Helvetica-Oblique',
    color: '#6B7280',
    fontSize: 9.5,
    marginBottom: 6,
  },
  question: { flexDirection: 'row', marginBottom: 6, fontSize: 10.5 },
  qNum: { width: 18, fontFamily: 'Helvetica-Bold' },
  qBody: { flex: 1, paddingRight: 6 },
  qMarks: { width: 60, textAlign: 'right', fontSize: 9.5, color: '#6B7280' },
  difficulty: { fontSize: 8.5, marginTop: 2, color: '#6B7280', fontFamily: 'Helvetica-Oblique' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, fontSize: 9.5, color: '#374151' },
  option: { width: '50%', paddingRight: 8, marginTop: 1 },

  // ── Answer key ───────────────────────────────────────
  answerKey: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  answerKeyTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  answerLine: { fontSize: 9.5, marginBottom: 2 },

  endMark: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 4,
  },
});

export function PaperPdfDocument({ paper }: { paper: GeneratedPaper }) {
  const instructions =
    paper.generalInstructions && paper.generalInstructions.length > 0
      ? paper.generalInstructions
      : [
          'Read all questions carefully before attempting.',
          'Attempt all questions from all sections.',
          'Show all calculations clearly for numerical problems.',
          'The marks allotted to each question are indicated against it.',
        ];

  return (
    <Document title={`${paper.subject} - ${paper.className}`}>
      <Page size="A4" style={styles.page}>
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>{paper.schoolName}</Text>
          <Text style={styles.subject}>{paper.subject}</Text>
          <Text style={styles.className}>{paper.className}</Text>
        </View>

        {/* ── Time + Maximum Marks ───────────────────── */}
        <View style={styles.timeMarksRow}>
          <Text>
            <Text style={styles.bold}>Time Allowed: </Text>
            {paper.timeAllowed}
          </Text>
          <Text>
            <Text style={styles.bold}>Maximum Marks: </Text>
            {paper.maximumMarks}
          </Text>
        </View>

        {/* ── General Instructions ───────────────────── */}
        <View style={styles.instructions}>
          {instructions.map((line, i) => (
            <Text key={i} style={styles.instructionLine}>
              • {line}
            </Text>
          ))}
        </View>

        {/* ── Student Info (Name / Roll No. / Section) ── */}
        <View style={styles.studentRow}>
          <View style={styles.studentField}>
            <Text style={styles.studentLabel}>Name:</Text>
            <View style={styles.studentBlank} />
          </View>
          <View style={styles.studentField}>
            <Text style={styles.studentLabel}>Roll No.:</Text>
            <View style={styles.studentBlank} />
          </View>
          <View style={styles.studentField}>
            <Text style={styles.studentLabel}>Section:</Text>
            <View style={styles.studentBlank} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Sections ───────────────────────────────── */}
        {paper.sections.map((section) => (
          <View key={section.label} wrap={false}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <Text style={styles.sectionInstruction}>{section.instruction}</Text>

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

        <Text style={styles.endMark}>— End of Question Paper —</Text>

        {/* ── Answer Key (new page) ──────────────────── */}
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
