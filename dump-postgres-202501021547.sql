PGDMP     4    /                 }            postgres     15.10 (Debian 15.10-1.pgdg120+1)    15.3 K    t           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            u           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            v           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            w           1262    5    postgres    DATABASE     s   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE postgres;
                admin    false            x           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   admin    false    3447                        2615    16389    thesis-management    SCHEMA     #   CREATE SCHEMA "thesis-management";
 !   DROP SCHEMA "thesis-management";
                admin    false            S           1247    16391 	   user_role    TYPE     j   CREATE TYPE "thesis-management".user_role AS ENUM (
    'student',
    'instructor',
    'secretariat'
);
 )   DROP TYPE "thesis-management".user_role;
       thesis-management          admin    false    6            �            1259    16488    announcements    TABLE       CREATE TABLE "thesis-management".announcements (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    presentation_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 .   DROP TABLE "thesis-management".announcements;
       thesis-management         heap    admin    false    6            �            1259    16487    announcements_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE "thesis-management".announcements_id_seq;
       thesis-management          admin    false    226    6            y           0    0    announcements_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE "thesis-management".announcements_id_seq OWNED BY "thesis-management".announcements.id;
          thesis-management          admin    false    225            �            1259    16430 
   committees    TABLE     �  CREATE TABLE "thesis-management".committees (
    id integer NOT NULL,
    thesis_id integer,
    member_id integer,
    role character varying(50) NOT NULL,
    invite_status character varying(50) DEFAULT 'invited'::character varying,
    invite_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    response_date timestamp without time zone,
    CONSTRAINT committees_invite_status_check CHECK (((invite_status)::text = ANY ((ARRAY['invited'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT committees_role_check CHECK (((role)::text = ANY ((ARRAY['supervisor'::character varying, 'member'::character varying])::text[])))
);
 +   DROP TABLE "thesis-management".committees;
       thesis-management         heap    admin    false    6            �            1259    16429    committees_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".committees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE "thesis-management".committees_id_seq;
       thesis-management          admin    false    6    220            z           0    0    committees_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE "thesis-management".committees_id_seq OWNED BY "thesis-management".committees.id;
          thesis-management          admin    false    219            �            1259    16469    grades    TABLE     Q  CREATE TABLE "thesis-management".grades (
    id integer NOT NULL,
    thesis_id integer,
    member_id integer,
    grade numeric(4,2) NOT NULL,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    criteria text,
    CONSTRAINT grades_grade_check CHECK (((grade >= (0)::numeric) AND (grade <= (100)::numeric)))
);
 '   DROP TABLE "thesis-management".grades;
       thesis-management         heap    admin    false    6            �            1259    16468    grades_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE "thesis-management".grades_id_seq;
       thesis-management          admin    false    224    6            {           0    0    grades_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE "thesis-management".grades_id_seq OWNED BY "thesis-management".grades.id;
          thesis-management          admin    false    223            �            1259    16448    progress    TABLE       CREATE TABLE "thesis-management".progress (
    id integer NOT NULL,
    thesis_id integer,
    instructor_id integer,
    note text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT progress_note_check CHECK ((length(note) <= 300))
);
 )   DROP TABLE "thesis-management".progress;
       thesis-management         heap    admin    false    6            �            1259    16447    progress_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE "thesis-management".progress_id_seq;
       thesis-management          admin    false    222    6            |           0    0    progress_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE "thesis-management".progress_id_seq OWNED BY "thesis-management".progress.id;
          thesis-management          admin    false    221            �            1259    16410    theses    TABLE     �  CREATE TABLE "thesis-management".theses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    detailed_file text,
    student_id integer,
    supervisor_id integer,
    status character varying(50) NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    cancellation_reason text,
    cancellation_date timestamp without time zone,
    cancellation_id integer,
    ap_number integer,
    CONSTRAINT theses_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'under_assignment'::character varying, 'under_examination'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);
 '   DROP TABLE "thesis-management".theses;
       thesis-management         heap    admin    false    6            �            1259    16409    theses_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".theses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE "thesis-management".theses_id_seq;
       thesis-management          admin    false    6    218            }           0    0    theses_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE "thesis-management".theses_id_seq OWNED BY "thesis-management".theses.id;
          thesis-management          admin    false    217            �            1259    16498    thesis_material    TABLE     |  CREATE TABLE "thesis-management".thesis_material (
    id integer NOT NULL,
    thesis_id integer,
    file_url text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    additional_material text,
    exam_date timestamp without time zone,
    exam_details text,
    library_link character varying(255),
    exam_report_file_url text,
    exam_title text
);
 0   DROP TABLE "thesis-management".thesis_material;
       thesis-management         heap    admin    false    6            �            1259    16497    thesis_material_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".thesis_material_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE "thesis-management".thesis_material_id_seq;
       thesis-management          admin    false    6    228            ~           0    0    thesis_material_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE "thesis-management".thesis_material_id_seq OWNED BY "thesis-management".thesis_material.id;
          thesis-management          admin    false    227            �            1259    16398    users    TABLE     L  CREATE TABLE "thesis-management".users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    role "thesis-management".user_role NOT NULL,
    password_hash text NOT NULL,
    contact_details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE "thesis-management".users;
       thesis-management         heap    admin    false    851    6            �            1259    16397    users_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE "thesis-management".users_id_seq;
       thesis-management          admin    false    216    6                       0    0    users_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE "thesis-management".users_id_seq OWNED BY "thesis-management".users.id;
          thesis-management          admin    false    215            �           2604    16491    announcements id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".announcements ALTER COLUMN id SET DEFAULT nextval('"thesis-management".announcements_id_seq'::regclass);
 L   ALTER TABLE "thesis-management".announcements ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    226    225    226            �           2604    16433    committees id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".committees ALTER COLUMN id SET DEFAULT nextval('"thesis-management".committees_id_seq'::regclass);
 I   ALTER TABLE "thesis-management".committees ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    220    219    220            �           2604    16472 	   grades id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".grades ALTER COLUMN id SET DEFAULT nextval('"thesis-management".grades_id_seq'::regclass);
 E   ALTER TABLE "thesis-management".grades ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    223    224    224            �           2604    16451    progress id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".progress ALTER COLUMN id SET DEFAULT nextval('"thesis-management".progress_id_seq'::regclass);
 G   ALTER TABLE "thesis-management".progress ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    221    222    222            �           2604    16413 	   theses id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".theses ALTER COLUMN id SET DEFAULT nextval('"thesis-management".theses_id_seq'::regclass);
 E   ALTER TABLE "thesis-management".theses ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    218    217    218            �           2604    16501    thesis_material id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".thesis_material ALTER COLUMN id SET DEFAULT nextval('"thesis-management".thesis_material_id_seq'::regclass);
 N   ALTER TABLE "thesis-management".thesis_material ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    228    227    228            �           2604    16401    users id    DEFAULT     ~   ALTER TABLE ONLY "thesis-management".users ALTER COLUMN id SET DEFAULT nextval('"thesis-management".users_id_seq'::regclass);
 D   ALTER TABLE "thesis-management".users ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    216    215    216            o          0    16488    announcements 
   TABLE DATA           g   COPY "thesis-management".announcements (id, title, content, presentation_date, created_at) FROM stdin;
    thesis-management          admin    false    226   �j       i          0    16430 
   committees 
   TABLE DATA           |   COPY "thesis-management".committees (id, thesis_id, member_id, role, invite_status, invite_date, response_date) FROM stdin;
    thesis-management          admin    false    220   l       m          0    16469    grades 
   TABLE DATA           e   COPY "thesis-management".grades (id, thesis_id, member_id, grade, recorded_at, criteria) FROM stdin;
    thesis-management          admin    false    224   �l       k          0    16448    progress 
   TABLE DATA           _   COPY "thesis-management".progress (id, thesis_id, instructor_id, note, created_at) FROM stdin;
    thesis-management          admin    false    222   Nn       g          0    16410    theses 
   TABLE DATA           �   COPY "thesis-management".theses (id, title, description, detailed_file, student_id, supervisor_id, status, started_at, completed_at, cancellation_reason, cancellation_date, cancellation_id, ap_number) FROM stdin;
    thesis-management          admin    false    218   �q       q          0    16498    thesis_material 
   TABLE DATA           �   COPY "thesis-management".thesis_material (id, thesis_id, file_url, uploaded_at, additional_material, exam_date, exam_details, library_link, exam_report_file_url, exam_title) FROM stdin;
    thesis-management          admin    false    228   �x       e          0    16398    users 
   TABLE DATA           o   COPY "thesis-management".users (id, name, email, role, password_hash, contact_details, created_at) FROM stdin;
    thesis-management          admin    false    216   �z       �           0    0    announcements_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('"thesis-management".announcements_id_seq', 3, true);
          thesis-management          admin    false    225            �           0    0    committees_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('"thesis-management".committees_id_seq', 38, true);
          thesis-management          admin    false    219            �           0    0    grades_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('"thesis-management".grades_id_seq', 26, true);
          thesis-management          admin    false    223            �           0    0    progress_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('"thesis-management".progress_id_seq', 18, true);
          thesis-management          admin    false    221            �           0    0    theses_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('"thesis-management".theses_id_seq', 90, true);
          thesis-management          admin    false    217            �           0    0    thesis_material_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('"thesis-management".thesis_material_id_seq', 57, true);
          thesis-management          admin    false    227            �           0    0    users_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('"thesis-management".users_id_seq', 40, true);
          thesis-management          admin    false    215            �           2606    16496     announcements announcements_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY "thesis-management".announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);
 W   ALTER TABLE ONLY "thesis-management".announcements DROP CONSTRAINT announcements_pkey;
       thesis-management            admin    false    226            �           2606    16436    committees committees_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);
 Q   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT committees_pkey;
       thesis-management            admin    false    220            �           2606    16476    grades grades_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT grades_pkey;
       thesis-management            admin    false    224            �           2606    16457    progress progress_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);
 M   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT progress_pkey;
       thesis-management            admin    false    222            �           2606    16418    theses theses_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT theses_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT theses_pkey;
       thesis-management            admin    false    218            �           2606    16507 $   thesis_material thesis_material_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY "thesis-management".thesis_material
    ADD CONSTRAINT thesis_material_pkey PRIMARY KEY (id);
 [   ALTER TABLE ONLY "thesis-management".thesis_material DROP CONSTRAINT thesis_material_pkey;
       thesis-management            admin    false    228            �           2606    16408    users users_email_key 
   CONSTRAINT     ^   ALTER TABLE ONLY "thesis-management".users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 L   ALTER TABLE ONLY "thesis-management".users DROP CONSTRAINT users_email_key;
       thesis-management            admin    false    216            �           2606    16406    users users_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY "thesis-management".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 G   ALTER TABLE ONLY "thesis-management".users DROP CONSTRAINT users_pkey;
       thesis-management            admin    false    216            �           2606    16442 $   committees committees_member_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT committees_member_id_fkey FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT committees_member_id_fkey;
       thesis-management          admin    false    220    3255    216            �           2606    16437 $   committees committees_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT committees_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT committees_thesis_id_fkey;
       thesis-management          admin    false    218    220    3257            �           2606    16529    committees fk_committees_member    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT fk_committees_member FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT fk_committees_member;
       thesis-management          admin    false    3255    216    220            �           2606    16524    committees fk_committees_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT fk_committees_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT fk_committees_thesis;
       thesis-management          admin    false    218    3257    220            �           2606    16549    grades fk_grades_member    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT fk_grades_member FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT fk_grades_member;
       thesis-management          admin    false    216    3255    224            �           2606    16544    grades fk_grades_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT fk_grades_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT fk_grades_thesis;
       thesis-management          admin    false    218    3257    224            �           2606    16539    progress fk_progress_instructor    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT fk_progress_instructor FOREIGN KEY (instructor_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT fk_progress_instructor;
       thesis-management          admin    false    216    3255    222            �           2606    16534    progress fk_progress_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT fk_progress_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT fk_progress_thesis;
       thesis-management          admin    false    222    3257    218            �           2606    16514    theses fk_theses_student    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT fk_theses_student FOREIGN KEY (student_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 O   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT fk_theses_student;
       thesis-management          admin    false    218    3255    216            �           2606    16519    theses fk_theses_supervisor    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT fk_theses_supervisor FOREIGN KEY (supervisor_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 R   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT fk_theses_supervisor;
       thesis-management          admin    false    218    216    3255            �           2606    16554 )   thesis_material fk_thesis_material_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".thesis_material
    ADD CONSTRAINT fk_thesis_material_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 `   ALTER TABLE ONLY "thesis-management".thesis_material DROP CONSTRAINT fk_thesis_material_thesis;
       thesis-management          admin    false    3257    218    228            �           2606    16482    grades grades_member_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT grades_member_id_fkey FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 S   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT grades_member_id_fkey;
       thesis-management          admin    false    216    224    3255            �           2606    16477    grades grades_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT grades_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 S   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT grades_thesis_id_fkey;
       thesis-management          admin    false    3257    224    218            �           2606    16463 $   progress progress_instructor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT progress_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT progress_instructor_id_fkey;
       thesis-management          admin    false    3255    216    222            �           2606    16458     progress progress_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT progress_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT progress_thesis_id_fkey;
       thesis-management          admin    false    3257    222    218            �           2606    16419    theses theses_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT theses_student_id_fkey FOREIGN KEY (student_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 T   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT theses_student_id_fkey;
       thesis-management          admin    false    3255    216    218            �           2606    16424     theses theses_supervisor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT theses_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 W   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT theses_supervisor_id_fkey;
       thesis-management          admin    false    216    218    3255            �           2606    16508 .   thesis_material thesis_material_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".thesis_material
    ADD CONSTRAINT thesis_material_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 e   ALTER TABLE ONLY "thesis-management".thesis_material DROP CONSTRAINT thesis_material_thesis_id_fkey;
       thesis-management          admin    false    228    3257    218            o     x����n� E��W�����UqݴU�e6șȨ6��U����,,E*BB���uKVYxɒv�)��a��ii?u�����\��4Ba�;�È��HK��1&>�/f�(���}&g����d1�`Fx�����ԴZ}MdO��h�W�F���}���;�񬵙tC�7<�2�,���H,��u�ٸ���"_'��2/���G�J�-+rRuV��1��(\�f�Ry>���p=wkn���ss��aĸOgE�e�c���0��I�1      i   �   x��ϱ�0���<E�u�����	�@p�"!��$F
R0���=�Hi�˩��8M�z�g�zA/��\�P >I4SN#)H����c�V:��c	�33kʚ��؇�WC��Xj�,u��X���!��lo��[H�	���;�6�L      m   �  x����n�0���S�b��dK��u(ڢ�]�DM<�`�����v��&(|3������@�9[X��l7�$����~lm�tm<ɦ����Ǳ}�c;�^j{��F[��0�]������vY�r�6
%�Z�D��8�n8�D	h�e�b��se*����"�0��^%�f�Eh�����6˄7�9���9��F*W�"����8E�������a'<����@+Q���ET�9�LV]Jΐ���ƌb�k1y�oD��{�ɢNC��1�1J���P�4ϻ��'���h��L8}l�J�Q��L:�5�.������� �R�M��k�Sn�f���)��.�#s:qev����o'J�Þ+ʌ'N�r�£�����,��m�U��+�Uh]I_įB����B      k   �  x�}UM��8=�_�S��|\S[�9m�&U{ًm���=���L<���ʾ�V��ׯ��Afy�ғ�'��bIX�i�G��fQ��h�Ʌ,M-9q�fg弸����u�A���tS��Y���4;f�HOM�4I�Bʪ���G39ݑ�z��5$�䐴����\@��g��*Ԡ���k߇P畧N��W�}#��j�$Y��yZ�Q��\Oޚnٚ�N�J
5u`����5��'/�4�y�B{|\�`& ��#[�fGeWa.���3�S\eYU�Q����if��Ӯ]�c����A��a��:��w�a&�p��j~ľ.��I�WqZT����/�^��&Ϝp�G�-X�d�����vX�g>v���a�I��C���HG�&I�N뢈��;�֌���1	�&���L��Ί[B�0HD�)�:��/����1��0|���Z��!��+����8K�ȢTn?M�k5p�e�/V��i�D���3���Ōs���\,��~��^S+u������(��c������
h�	�rh����3z���)9��7����/�����8�hK�/��[^�<"����.@f��0�����
=�U �=t��cX�1C�#���D�B��� G���`���$�F�/9]Q���MO�<�N3��V95=1�8p��Fz�c�>���yt���ݲM�S^a���d�����e^JtZ�&y�p;1��Gl-R��M!��ތ�c3G�&�E����Ư3m�vo�}5PP,�6w�������U��r�j��밊����/�ǚ�E��R��U�&E�v���̶-�V�v��֋�m��/H��#�n���]�;ޗ�����Q�F1�TVi���j&�%��1I�I&���d�˸�e]���qE? �K�      g   �  x��X[o�8~V~ߦD�.V|yK�val�f��̋���h��DjHʩ���;�l��d��	8��s��w���,��/��c����Í�FI�d[�DeK��q%-s+a�O|�Km�?�BlD��J(��qŠ����;U֫� w�>���ɹ�tf�V��<sY�g�5>�ŲF�?��趥8g5���UAj�T\�b\M���,��pR���Zص��|��6k(���B�5b
!Ǘ�������ƣ4�.&�a�]d���0M�Qv1��"Y�(h|��ʥ"MA%�0N�d��t���I6�&i������w�N�O������E��[��ص5��A��{A6x@n��
����r��t+T�i&Ԋ�a�p�'�K��O�s��A*���Y�t!J;�M��W^I�-��Q���0
���w0��>�WFpg�o�l��|%���Z��ۛ�E�H��>�%�\r'
h��+��]��q�eS�5p��7$g���z�F0����8R*e|p+��T��.eoKQ_�(��"���|�k�`�6�v������ �),v�U+
mp�[V�5�/�*�'��KU��0"7�t���D�m�	߼Fڵ��YB��"�km[^	��@�A�\%�}��J����OQ2�'q�?E!���?!�I�$�S<�|��[�4cM�t�Ë�x8<�Q<���t�ղ�k����QZ�������K�m>m�~����5�Yl�x�G�(el��{P�������{+�g%�Y1���<����<c���%��B�!�g���Ĩ-ze\(�;8�Dn(�ω/�R?��8N�ׇv�1 s2�f��?���x<gQx|:�8{��х����P�����(������l<�RtwڡvC���A���]������f�u)�����5�etSw珲t���X�V�0���(]�$��*ݖ��a�#��m�T��N�c4���^#�������n�����-^6��0y}��C+��P���@�>������r����������P�5�yK�0��k�hG�(N�I�N̒���??]�5غe�pG]@M�|�*�Ah<	���v�T��\ڊ*py?c׽������Z|�|;e�슄�~�:5Yt<0";��D����Y��V�C�L��[��n�+�u��q�+6s4��,[*�W����6V�M;�ވ��_a��a�G#w� u$چ�U����I��{�b!����?˒��a�v�>N���ô�Zi�BQ�K�B��,�t�e��M�2���UM�Y�a��h<�G�$$C %��=ӠG��P~e{8t�Cōc��i9^��~T���^a�S�%�h8Uc�����2U��'� ��2�g#[ `-(=k�<Y��»	Pi���y۷b��O<o�[\}���n��-��4����}|:Y�OF��l�i���G��!��i�c�۽O����o�烰�t���^A��vN+ 4��v�Z�ev��.&�t8�F�A|��w��âr]�m��t����n�����}�����xw7����-�*<�eG:��ӧ�N&c_L�l'�d2�dcz�=�oj|V�����'�W��I��R�k׿\�ܭ=�	L{���y�O/�"�W�i�v��R⫘��yG���ʜ������ ��q;��=�'*^�R��l��J�mE���+[2e���۟���l?z���c\5�y�s��7�v�zh�`��8^��r;���������쿳��      q   �  x����n�0���S�j[ԇ�nC�9,�����L"Զ<K�>��;�̀x�ҟ�Q")*)�2滧��Ș���c~�������mh|1{����=u�c�C��fB�0s�u�e.�"�_�jK��Ίdhv �P1�XL�J�����Bg�_�i3�'J���[J��Kw���I��o��M'wǇ���6���aXf��]"����u9ްۻ���h��0�| �	�}�Ob���΍�.�nٺ�i2랹��f���l����S=g�};�@��������1ǘƋ
��:)��z����P���P&RsT�%J�
U�e�U�y9����۳�����,�
@��*�bJ��9��������r9%A�5U9_NiX^.�A���SJ��"�����_�y���gា���<�������85��¯���I�(�7�A]      e   �  x�͗�R�H��GO1��Ҩ4'|���EY��ڛ�5�G�d���w��%E��ko�nYv�7�����N�J�x��w	
MlOM|��P%�=KcT��N�spy��p�7�]N�y���v��典����o�\}[���v}rK����_�K�sp3O5��
�9c��x�S��=WpF���23���:\��;>��J��"���C�!!����qg$�ͨg�2�W�.�HBh�&l1�$/��H�_�E��q.D+�k�.~A�E�T1��=].�ᢀ��UX�j��BfZ֝z�{�ڪ���[*�G%>b�-|�bh"U7c�����Չ�N�x���z�f�>�lG=��Q�0o{���w�M��pԱ��XFP<ZL�����x����E�b|�aR�p����t؄�7�\&��\GP�2�]�I���`���sHG=��w�0|
�<!4��zE�t���T���@uOG3�G�u%ǰ4�Av�Bk
X����f�%6<y���L�E���y�6GKU�W�}�K:����:ׅB�2��L�+���y�tZV%�0 �c�����!.�ɣ������tӱi:�K���m���;���� o����Yߢ�
�q�g�&�&��K~��lJ�@��V� #�` ���=@�Ĥ�TT��*�{N ]t����9J��6�8����m�׏VW�3�CEQzט��h�C���T��W��+�ؾ+�~-��}���-0�_d2�[�(���,��w�p- ��ՃAy�t4�X�G���^ƠC}٤��؞=.� ���W��b��2)��s0�G��(��!��ifc��n��W��3̆�=������w\�h��x]9&��j��k.��0��{wЕ�eN��Ry�V{�O�Pw!��!�gT��f��i�f���,��-����.�     